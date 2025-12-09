import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
            // 3. Mettre à jour la commande locale et décrémenter le stock

            // Retrouver la commande locale via paymentId (le orderID PayPal)
            const localOrder = await prisma.order.findFirst({
                where: { paymentId: orderID },
                include: { items: true }
            });

            if (localOrder) {
                // Transaction pour mettre à jour le statut et décrémenter le stock
                await prisma.$transaction(async (tx) => {
                    // Update statut
                    await tx.order.update({
                        where: { id: localOrder.id },
                        data: { status: "paid" }
                    });

                    // Décrémenter les stocks
                    for (const item of localOrder.items) {
                        await tx.creation.update({
                            where: { id: item.creationId },
                            data: { stock: { decrement: item.quantity } }
                        });
                    }
                });
            }

            return NextResponse.json({ status: "COMPLETED", details: captureData, orderId: localOrder?.id });
        } else {
            return NextResponse.json({ status: "FAILED", details: captureData }, { status: 500 });
        }

    } catch (error) {
        console.error("PayPal Capture Error:", error);
        return NextResponse.json({ error: "Erreur capture PayPal" }, { status: 500 });
    }
}
