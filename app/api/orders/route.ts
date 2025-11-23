import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

// Schema de validation pour la commande
const orderSchema = z.object({
    items: z.array(
        z.object({
            creationId: z.string(),
            quantity: z.number().min(1),
            price: z.number().min(0),
        })
    ),
    shipping: z.object({
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        email: z.string().email(),
        address: z.string().min(5),
        city: z.string().min(2),
        postalCode: z.string().min(4),
        country: z.string().default("France"),
    }),
    total: z.number().min(0),
});

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        creation: {
                            select: {
                                title: true,
                                image: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Transformer les données pour correspondre au format attendu par le front-end
        const formattedOrders = orders.map((order) => ({
            id: order.id,
            status: order.status,
            total: order.total,
            createdAt: order.createdAt.toISOString(),
            items: order.items.map((item) => ({
                creationId: item.creationId,
                quantity: item.quantity,
                price: item.price,
                title: item.creation.title,
                image: item.creation.image,
            })),
            shipping: {
                firstName: order.firstName,
                lastName: order.lastName,
                email: order.email,
                address: order.address,
                city: order.city,
                postalCode: order.postalCode,
                country: order.country,
            },
        }));

        return NextResponse.json({ orders: formattedOrders });
    } catch (error) {
        console.error("Erreur lors de la récupération des commandes:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des commandes" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Valider les données
        const result = orderSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Données invalides", details: result.error.format() },
                { status: 400 }
            );
        }

        const { items, shipping, total } = result.data;

        // Utiliser une transaction pour assurer l'intégrité des données (stock)
        const order = await prisma.$transaction(async (tx) => {
            // 1. Vérifier le stock pour chaque article
            for (const item of items) {
                const creation = await tx.creation.findUnique({
                    where: { id: item.creationId },
                });

                if (!creation) {
                    throw new Error(`Création introuvable: ${item.creationId}`);
                }

                if (creation.stock < item.quantity) {
                    throw new Error(`Stock insuffisant pour: ${creation.title}`);
                }

                // 2. Décrémenter le stock
                await tx.creation.update({
                    where: { id: item.creationId },
                    data: { stock: creation.stock - item.quantity },
                });
            }

            // 3. Créer la commande
            const newOrder = await tx.order.create({
                data: {
                    total,
                    status: "pending",
                    firstName: shipping.firstName,
                    lastName: shipping.lastName,
                    email: shipping.email,
                    address: shipping.address,
                    city: shipping.city,
                    postalCode: shipping.postalCode,
                    country: shipping.country,
                    items: {
                        create: items.map((item) => ({
                            creationId: item.creationId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
                include: {
                    items: true,
                },
            });

            return newOrder;
        });

        return NextResponse.json(
            { success: true, order, message: "Commande créée avec succès" },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Erreur lors de la création de la commande:", error);
        return NextResponse.json(
            { error: error.message || "Une erreur est survenue lors de la création de la commande" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { orderId, status, trackingNumber } = body;

        if (!orderId) {
            return NextResponse.json(
                { error: "ID de commande requis" },
                { status: 400 }
            );
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: status || undefined,
                // trackingNumber n'existe pas encore dans le schéma Prisma, on l'ignore pour l'instant
            },
        });

        return NextResponse.json({
            success: true,
            order: updatedOrder,
            message: "Commande mise à jour",
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la commande:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour" },
            { status: 500 }
        );
    }
}
