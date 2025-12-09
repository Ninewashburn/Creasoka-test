import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const auth = await verifyAuth();
        if (!auth) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { cart, total } = await request.json();

        // Vérifier le stock ici serait idéal (on le fera plus tard pour la robustesse)

        const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
        const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
        const BASE_URL = process.env.NODE_ENV === "production"
            ? "https://api-m.paypal.com"
            : "https://api-m.sandbox.paypal.com";

        // 1. Obtenir un Access Token PayPal
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

        // 2. Créer la commande
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
                        amount: {
                            currency_code: "EUR",
                            value: total.toFixed(2),
                        },
                        description: `Commande CreaSoka - ${cart.length} articles`
                    },
                ],
            }),
        });

        const orderData = await orderResponse.json();
        return NextResponse.json(orderData);

    } catch (error) {
        console.error("PayPal Create Order Error:", error);
        return NextResponse.json({ error: "Erreur création commande PayPal" }, { status: 500 });
    }
}
