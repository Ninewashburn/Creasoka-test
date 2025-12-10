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

    const { items, shipping } = await request.json(); // On reçoit items + shipping pour créer la commande locale

    // 1. Calculer le total et décrémenter le stock de manière atomique (évite race condition)
    // Utiliser une transaction pour garantir l'intégrité (stock + création commande)
    const localOrder = await prisma.$transaction(async (tx) => {
        let calculatedTotal = 0;
        const orderItems = [];

        for (const item of items) {
            const creation = await tx.creation.findUnique({
                where: { id: item.creationId },
                select: { id: true, title: true, price: true, stock: true }
            });

            if (!creation) {
                throw new Error(`Article introuvable: ${item.creationId}`);
            }

            // Décrémenter le stock de manière atomique (évite race condition)
            // Le stock est réservé immédiatement lors de la création de la commande PayPal
            const updateResult = await tx.creation.updateMany({
                where: {
                    id: item.creationId,
                    stock: { gte: item.quantity } // Condition atomique
                },
                data: {
                    stock: { decrement: item.quantity }
                }
            });

            // Si aucune ligne n'a été mise à jour, c'est que le stock est insuffisant
            if (updateResult.count === 0) {
                throw new Error(`Stock insuffisant pour: ${creation.title}`);
            }

            calculatedTotal += creation.price * item.quantity;
            orderItems.push({
                creationId: creation.id,
                quantity: item.quantity,
                price: creation.price
            });
        }

        // 2. Créer la commande locale en statut "pending" (en attente de paiement PayPal)
        // Le stock est déjà décrémenté, donc réservé pour cette commande
        const newOrder = await tx.order.create({
            data: {
                userId: auth.user.id,
                total: calculatedTotal,
                status: "pending", // En attente de confirmation PayPal
                firstName: shipping.firstName,
                lastName: shipping.lastName,
                email: shipping.email,
                address: shipping.address,
                city: shipping.city,
                postalCode: shipping.postalCode,
                country: shipping.country,
                items: {
                    create: orderItems
                },
                paymentMethod: "paypal"
            }
        });

        return newOrder;
    });

    const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    const BASE_URL = process.env.NODE_ENV === "production" 
        ? "https://api-m.paypal.com" 
        : "https://api-m.sandbox.paypal.com";

    // 3. Obtenir Access Token PayPal
    const authResponse = await fetch(`${BASE_URL}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
    });

    const authData = await authResponse.json();
    if (!authResponse.ok) {
        throw new Error(authData.error_description || "Erreur auth PayPal");
    }

    // 4. Créer la commande PayPal
    const orderResponse = await fetch(`${BASE_URL}/v2/checkout/orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authData.access_token}`,
        },
        body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [
                {
                    reference_id: localOrder.id, // Lier ID local
                    amount: {
                        currency_code: "EUR",
                        value: calculatedTotal.toFixed(2),
                    },
                    description: `CreaSoka Order #${localOrder.id}`
                },
            ],
        }),
    });

    const orderData = await orderResponse.json();
    
    // 5. Sauvegarder l'ID PayPal dans la commande locale
    if (orderData.id) {
        await prisma.order.update({
            where: { id: localOrder.id },
            data: { paymentId: orderData.id }
        });
    }

    return NextResponse.json(orderData);

  } catch (error) {
    logger.error("PayPal Create Order Error", error);
    return NextResponse.json({ error: "Erreur création commande PayPal" }, { status: 500 });
  }
}
