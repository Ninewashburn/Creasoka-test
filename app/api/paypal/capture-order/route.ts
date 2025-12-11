import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/sentry";

export async function POST(request: Request) {
    try {
        const auth = await verifyAuth();
        if (!auth) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { orderID } = await request.json(); // PayPal Order ID

        const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
        const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
        const BASE_URL = process.env.NODE_ENV === "production"
            ? "https://api-m.paypal.com"
            : "https://api-m.sandbox.paypal.com";

        // 1. Auth PayPal
        const authResponse = await fetch(`${BASE_URL}/v1/oauth2/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
            },
            body: "grant_type=client_credentials",
        });

        const authData = await authResponse.json();

        // 2. Capturer
        const captureResponse = await fetch(`${BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authData.access_token}`,
            },
        });

        const captureData = await captureResponse.json();

        if (captureData.status === "COMPLETED") {
            // 3. Mettre à jour la commande locale (le stock a déjà été décrémenté lors de create-order)

            // Retrouver la commande locale via paymentId (le orderID PayPal)
            const localOrder = await prisma.order.findFirst({
                where: { paymentId: orderID }
            });

            if (localOrder) {
                // Parse custom_id to get reservation IDs
                const orderData = await prisma.order.findUnique({
                    where: { id: localOrder.id },
                });

                // Extract reservation IDs from PayPal custom_id
                const purchaseUnit = captureData.purchase_units?.[0];
                let reservationIds: string[] = [];
                if (purchaseUnit?.custom_id) {
                    try {
                        const customData = JSON.parse(purchaseUnit.custom_id);
                        reservationIds = customData.reservations || [];
                    } catch (error) {
                        logger.error("Failed to parse custom_id", error);
                    }
                }

                // Update order status AND link reservations
                await prisma.$transaction(async (tx) => {
                    // Mark order as paid
                    await tx.order.update({
                        where: { id: localOrder.id },
                        data: { status: "paid" },
                    });

                    // Link reservations to this order (confirm them)
                    if (reservationIds.length > 0) {
                        await tx.stockReservation.updateMany({
                            where: { id: { in: reservationIds } },
                            data: { orderId: localOrder.id },
                        });
                    }
                });
            }

            return NextResponse.json({ status: "COMPLETED", details: captureData, orderId: localOrder?.id });
        } else {
            // Si le paiement échoue, restaurer le stock immédiatement
            const localOrder = await prisma.order.findFirst({
                where: { paymentId: orderID },
                include: { items: true }
            });

            if (localOrder && localOrder.status === "pending") {
                // Extract reservation IDs to delete them
                const purchaseUnit = captureData.purchase_units?.[0];
                let reservationIds: string[] = [];
                if (purchaseUnit?.custom_id) {
                    try {
                        const customData = JSON.parse(purchaseUnit.custom_id);
                        reservationIds = customData.reservations || [];
                    } catch (error) {
                        logger.error("Failed to parse custom_id for rollback", error);
                    }
                }

                await prisma.$transaction(async (tx) => {
                    // Restore stock
                    for (const item of localOrder.items) {
                        await tx.creation.update({
                            where: { id: item.creationId },
                            data: { stock: { increment: item.quantity } },
                        });
                    }

                    // Delete reservations (failed payment)
                    if (reservationIds.length > 0) {
                        await tx.stockReservation.deleteMany({
                            where: { id: { in: reservationIds } },
                        });
                    }

                    // Marquer la commande comme payment_failed
                    await tx.order.update({
                        where: { id: localOrder.id },
                        data: { status: "payment_failed" }
                    });
                });

                logger.info(`Stock restauré pour paiement échoué: ${localOrder.id}`);
            }

            return NextResponse.json({ status: "FAILED", details: captureData }, { status: 500 });
        }

    } catch (error) {
        logger.error("PayPal Capture Error", error);
        return NextResponse.json({ error: "Erreur capture PayPal" }, { status: 500 });
    }
}
