import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/sentry";

/**
 * Endpoint de nettoyage des commandes PayPal abandonnées
 *
 * Ce endpoint restaure le stock pour les commandes PayPal en status "pending"
 * qui ont été créées il y a plus de 30 minutes (commandes abandonnées).
 *
 * Usage:
 * - Peut être appelé manuellement via POST /api/orders/cleanup-abandoned
 * - Recommandé: Configurer un cron job pour l'exécuter toutes les heures
 * - Utilise une clé API pour sécuriser l'accès (CRON_SECRET dans .env)
 */
export async function POST(request: Request) {
    try {
        // Sécurité: Vérifier la clé API pour éviter les appels non autorisés
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // 1. Trouver les commandes PayPal abandonnées (pending + créées il y a plus de 30 minutes)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

        const abandonedOrders = await prisma.order.findMany({
            where: {
                status: "pending",
                paymentMethod: "paypal",
                createdAt: {
                    lt: thirtyMinutesAgo
                }
            },
            include: {
                items: true
            }
        });

        logger.info(`Nettoyage: ${abandonedOrders.length} commande(s) abandonnée(s) trouvée(s)`);

        let restoredCount = 0;
        let errors = 0;

        // 2. Restaurer le stock et annuler les commandes
        for (const order of abandonedOrders) {
            try {
                await prisma.$transaction(async (tx) => {
                    // Restaurer le stock pour chaque article
                    for (const item of order.items) {
                        await tx.creation.update({
                            where: { id: item.creationId },
                            data: {
                                stock: { increment: item.quantity }
                            }
                        });
                    }

                    // Marquer la commande comme annulée
                    await tx.order.update({
                        where: { id: order.id },
                        data: { status: "cancelled" }
                    });
                });

                restoredCount++;
                logger.info(`Stock restauré pour commande abandonnée: ${order.id}`);
            } catch (error) {
                errors++;
                logger.error(`Erreur restauration stock pour commande ${order.id}`, error);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Nettoyage terminé`,
            stats: {
                found: abandonedOrders.length,
                restored: restoredCount,
                errors: errors
            }
        });

    } catch (error) {
        logger.error("Erreur lors du nettoyage des commandes abandonnées", error);
        return NextResponse.json(
            { error: "Erreur lors du nettoyage" },
            { status: 500 }
        );
    }
}

// Permettre aussi GET pour faciliter les tests/debugging en dev
export async function GET() {
    if (process.env.NODE_ENV !== "production") {
        // En dev, rediriger vers POST pour tester
        return POST(new Request("http://localhost/api/orders/cleanup-abandoned", {
            method: "POST",
            headers: { "authorization": `Bearer ${process.env.CRON_SECRET || "dev"}` }
        }));
    }

    return NextResponse.json({
        message: "Utilisez POST avec Authorization header"
    }, { status: 405 });
}
