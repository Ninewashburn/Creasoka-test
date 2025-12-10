import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { logger } from "@/lib/sentry";

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
        const resource = body.resource;

        logger.info(`Webhook PayPal Validé: ${eventType}`);

        if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
            // Traitement (déjà géré synchronement, mais bon pour backup)
            logger.info("Capture confirmée par webhook", { resourceId: resource.id });
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
