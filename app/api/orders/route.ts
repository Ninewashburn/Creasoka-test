import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyAuth, validateOrigin } from "@/lib/auth";
import { headers } from "next/headers";

export const runtime = "nodejs";

// Schema de validation pour la commande
// Note: Le prix et le total ne sont PAS fournis par le client pour éviter les manipulations
const orderSchema = z.object({
    items: z.array(
        z.object({
            creationId: z.string(),
            quantity: z.number().min(1).int(),
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
});

export async function GET() {
    try {
        // Vérification Auth (Admin seulement)
        await verifyAuth();

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

        if (error instanceof Error && (error.message === "Non autorisé" || error.message === "Token invalide")) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        return NextResponse.json(
            { error: "Erreur lors de la récupération des commandes" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const headersList = await headers();

        // CSRF Protection
        if (!validateOrigin(headersList)) {
            return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
        }

        const body = await request.json();

        // Valider les données
        const result = orderSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Données invalides", details: result.error.format() },
                { status: 400 }
            );
        }

        const { items, shipping } = result.data;

        // Utiliser une transaction pour assurer l'intégrité des données (stock + prix)
        const order = await prisma.$transaction(async (tx) => {
            // 1. Récupérer les créations et calculer le total côté serveur
            const orderItems = [];
            let calculatedTotal = 0;

            for (const item of items) {
                const creation = await tx.creation.findUnique({
                    where: { id: item.creationId },
                    select: { id: true, title: true, price: true, stock: true },
                });

                if (!creation) {
                    throw new Error(`Création introuvable: ${item.creationId}`);
                }

                // 2. Décrémenter le stock de manière atomique (évite race condition)
                const updateResult = await tx.creation.updateMany({
                    where: {
                        id: item.creationId,
                        stock: { gte: item.quantity }, // Condition atomique
                    },
                    data: {
                        stock: { decrement: item.quantity },
                    },
                });

                // Si aucune ligne n'a été mise à jour, c'est que le stock est insuffisant
                if (updateResult.count === 0) {
                    throw new Error(`Stock insuffisant pour: ${creation.title}`);
                }

                // Utiliser le prix réel de la base de données (pas celui du client)
                const itemTotal = creation.price * item.quantity;
                calculatedTotal += itemTotal;

                orderItems.push({
                    creationId: creation.id,
                    quantity: item.quantity,
                    price: creation.price, // Prix vérifié côté serveur
                });
            }

            // 3. Créer la commande avec le total calculé côté serveur
            const newOrder = await tx.order.create({
                data: {
                    total: calculatedTotal, // Total calculé côté serveur
                    status: "pending",
                    firstName: shipping.firstName,
                    lastName: shipping.lastName,
                    email: shipping.email,
                    address: shipping.address,
                    city: shipping.city,
                    postalCode: shipping.postalCode,
                    country: shipping.country,
                    items: {
                        create: orderItems,
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
    } catch (error) {
        console.error("Erreur lors de la création de la commande:", error);

        const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue lors de la création de la commande";

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        // Vérification Auth (Admin seulement)
        await verifyAuth();

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

        if (error instanceof Error && (error.message === "Non autorisé" || error.message === "Token invalide")) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        return NextResponse.json(
            { error: "Erreur lors de la mise à jour" },
            { status: 500 }
        );
    }
}
