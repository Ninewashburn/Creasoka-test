import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { items, shipping } = await request.json(); // On reçoit items + shipping pour créer la commande locale

    // 1. Calculer le total et vérifier le stock côté serveur
    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of items) {
        const creation = await prisma.creation.findUnique({
            where: { id: item.creationId },
            select: { id: true, title: true, price: true, stock: true }
        });

        if (!creation) {
            return NextResponse.json({ error: `Article introuvable: ${item.creationId}` }, { status: 400 });
        }

        if (creation.stock < item.quantity) {
             return NextResponse.json({ error: `Stock insuffisant pour: ${creation.title}` }, { status: 400 });
        }

        calculatedTotal += creation.price * item.quantity;
        orderItems.push({
            creationId: creation.id,
            quantity: item.quantity,
            price: creation.price
        });
    }

    // 2. Créer la commande locale en statut "pending_payment"
    // Note: pending_payment n'est pas dans l'enum schema par défaut (souvent 'pending'), 
    // assurons-nous que 'pending' est utilisé si l'enum est strict, ou modifions le code pour utiliser 'pending' 
    // et différencier via paymentId null vs rempli.
    // Le schema dit: @default("pending") // pending, paid, shipped, delivered, cancelled
    
    const localOrder = await prisma.order.create({
        data: {
            userId: auth.user.id, // Lier à l'utilisateur
            total: calculatedTotal,
            status: "pending", // On garde pending pour l'instant
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
    console.error("PayPal Create Order Error:", error);
    return NextResponse.json({ error: "Erreur création commande PayPal" }, { status: 500 });
  }
}
