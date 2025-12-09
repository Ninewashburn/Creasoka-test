import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET() {
    try {
        const auth = await verifyAuth();
        if (!auth) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { email } = auth.user;

        // Récupérer l'utilisateur pour avoir son ID (si nécessaire, ou utiliser email si l'utilisateur est lié par email)
        // Ici le Token contient l'ID normalement.
        const userId = auth.user.id;

        // Récupérer les commandes de l'utilisateur
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { userId: userId }, // Si lié par ID
                    { email: email }    // Si lié par email (fallback pour guest checkout converti)
                ]
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                items: {
                    include: {
                        creation: true
                    }
                }
            }
        });

        // Transformer les données pour le frontend
        const formattedOrders = orders.map(order => ({
            id: order.id,
            date: order.createdAt,
            status: order.status,
            total: order.total,
            items: order.items.map(item => ({
                id: item.id,
                title: item.creation.title,
                quantity: item.quantity,
                price: item.price,
                image: item.creation.image
            })),
            shipping: {
                address: order.address,
                city: order.city,
                postalCode: order.postalCode,
                country: order.country
            }
        }));

        return NextResponse.json({
            orders: formattedOrders
        });

    } catch (error) {
        console.error("Erreur profile:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
