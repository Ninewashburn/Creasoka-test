import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { logger } from "@/lib/sentry";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
    try {
        const bodyText = await request.text(); // Raw body needed for verification
        const headersList = await headers();

        // 1. Récupérer les headers de signature
        const transmissionId = headersList.get("paypal-transmission-id");
        const transmissionTime = headersList.get("paypal-transmission-time");
        const certUrl = headersList.get("paypal-cert-url");
        const authAlgo = headersList.get("paypal-auth-algo");
        const transmissionSig = headersList.get("paypal-transmission-sig");

        // Webhook ID (depuis dashboard PayPal)
        const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

        if (!WEBHOOK_ID) {
            logger.error("PAYPAL_WEBHOOK_ID manquant");
            // Fail safe: accept for now in dev, or 500? Use strict in prod.
            if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Config missing" }, { status: 500 });
        }

        // 2. Vérifier la signature via l'API PayPal
        if (WEBHOOK_ID) {
            const isValid = await verifyPayPalSignature(
                bodyText,
                { transmissionId, transmissionTime, certUrl, authAlgo, transmissionSig },
                WEBHOOK_ID
            );

            if (!isValid) {
                logger.error("Signature Webhook Invalide");
                return NextResponse.json({ error: "Invalid Signature" }, { status: 401 });
            }
        }

        // 3. Traiter l'événement
        const body = JSON.parse(bodyText);
        const eventType = body.event_type;
        const eventId = body.id; // Event ID unique pour idempotence
        const resource = body.resource;

        logger.info(`Webhook PayPal Validé: ${eventType}`, { eventId });

        // Vérifier si l'événement a déjà été traité (idempotence)
        const existingEvent = await prisma.processedWebhookEvent.findUnique({
            where: { eventId },
        });

        if (existingEvent) {
            logger.info("Événement déjà traité (idempotent)", { eventId });
            return NextResponse.json({ received: true, alreadyProcessed: true });
        }

        // Traiter selon le type d'événement
        if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
            await handlePaymentCaptureCompleted(resource, eventId);
        } else if (eventType === "PAYMENT.CAPTURE.DENIED" || eventType === "PAYMENT.CAPTURE.FAILED") {
            await handlePaymentCaptureFailed(resource, eventId);
        } else {
            logger.info(`Type d'événement non géré: ${eventType}`);
            // Marquer comme traité quand même pour éviter les retraitements
            await prisma.processedWebhookEvent.create({
                data: { eventId, eventType, processed: true },
            });
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        logger.error("Erreur Webhook PayPal", error);
        return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
    }
}

interface PayPalHeaders {
    transmissionId: string | null;
    transmissionTime: string | null;
    certUrl: string | null;
    authAlgo: string | null;
    transmissionSig: string | null;
}

async function verifyPayPalSignature(
    body: string,
    headers: PayPalHeaders,
    webhookId: string
): Promise<boolean> {
    const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    const BASE_URL = process.env.NODE_ENV === "production"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

    // Auth
    const authResponse = await fetch(`${BASE_URL}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
    });
    const authData = await authResponse.json();

    // Verify
    const verifyResponse = await fetch(`${BASE_URL}/v1/notifications/verify-webhook-signature`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authData.access_token}`,
        },
        body: JSON.stringify({
            auth_algo: headers.authAlgo,
            cert_url: headers.certUrl,
            transmission_id: headers.transmissionId,
            transmission_sig: headers.transmissionSig,
            transmission_time: headers.transmissionTime,
            webhook_id: webhookId,
            webhook_event: JSON.parse(body)
        })
    });

    const verifyData = await verifyResponse.json();
    return verifyData.verification_status === "SUCCESS";
}

/**
 * Traite un paiement capturé avec succès
 */
async function handlePaymentCaptureCompleted(resource: any, eventId: string) {
    const captureId = resource.id;

    try {
        // Trouver la commande par payment ID
        const order = await prisma.order.findFirst({
            where: { paymentId: captureId },
            include: { items: { include: { creation: true } } },
        });

        if (!order) {
            logger.warn("Commande introuvable pour capture PayPal", { captureId });
            // Marquer quand même comme traité
            await prisma.processedWebhookEvent.create({
                data: { eventId, eventType: "PAYMENT.CAPTURE.COMPLETED", processed: true },
            });
            return;
        }

        // Mettre à jour le statut de la commande
        await prisma.order.update({
            where: { id: order.id },
            data: { status: "paid" },
        });

        // Envoyer email de confirmation
        const itemsList = order.items
            .map((item) => `- ${item.creation.title} x${item.quantity} = ${item.price}€`)
            .join("\n");

        await sendEmail({
            to: order.email,
            subject: "Confirmation de commande - Crea'Soka",
            html: `
                <h2>Merci pour votre commande !</h2>
                <p>Bonjour ${order.firstName},</p>
                <p>Votre paiement a été confirmé.</p>
                <h3>Détails de la commande :</h3>
                <pre>${itemsList}</pre>
                <p><strong>Total : ${order.total}€</strong></p>
                <p>Votre commande sera expédiée prochainement à l'adresse :</p>
                <address>
                    ${order.firstName} ${order.lastName}<br>
                    ${order.address}<br>
                    ${order.postalCode} ${order.city}<br>
                    ${order.country}
                </address>
            `,
            text: `Merci pour votre commande !\n\nDétails :\n${itemsList}\n\nTotal : ${order.total}€`,
        });

        // Marquer l'événement comme traité
        await prisma.processedWebhookEvent.create({
            data: { eventId, eventType: "PAYMENT.CAPTURE.COMPLETED", processed: true },
        });

        logger.info("Paiement traité avec succès", { orderId: order.id, captureId });
    } catch (error) {
        logger.error("Erreur traitement PAYMENT.CAPTURE.COMPLETED", error);
        throw error;
    }
}

/**
 * Traite un paiement échoué ou refusé
 */
async function handlePaymentCaptureFailed(resource: any, eventId: string) {
    const captureId = resource.id;

    try {
        const order = await prisma.order.findFirst({
            where: { paymentId: captureId },
        });

        if (order) {
            await prisma.order.update({
                where: { id: order.id },
                data: { status: "payment_failed" },
            });

            logger.warn("Paiement échoué", { orderId: order.id, captureId });
        }

        // Marquer comme traité
        await prisma.processedWebhookEvent.create({
            data: { eventId, eventType: "PAYMENT.CAPTURE.FAILED", processed: true },
        });
    } catch (error) {
        logger.error("Erreur traitement PAYMENT.CAPTURE.FAILED", error);
        throw error;
    }
}
