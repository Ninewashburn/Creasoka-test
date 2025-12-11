import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/sentry";

/**
 * Cron job to cleanup expired stock reservations
 * Run every 5 minutes via Vercel Cron or similar
 * 
 * Setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-reservations",
 *     "schedule": "*//*5 * * * *"
*   }]
* }
*/
export async function GET(request: Request) {
    try {
        // Security: Check authorization header
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find expired reservations that haven't been confirmed (no orderId)
        const expiredReservations = await prisma.stockReservation.findMany({
            where: {
                expiresAt: { lt: new Date() },
                orderId: null, // Not confirmed
            },
            include: { creation: true },
        });

        if (expiredReservations.length === 0) {
            return NextResponse.json({ cleaned: 0, message: "No expired reservations" });
        }

        // Restore stock for each expired reservation
        for (const reservation of expiredReservations) {
            await prisma.creation.update({
                where: { id: reservation.creationId },
                data: { stock: { increment: reservation.quantity } },
            });

            logger.info("Restored stock for expired reservation", {
                reservationId: reservation.id,
                creationId: reservation.creationId,
                quantity: reservation.quantity,
            });
        }

        // Delete expired reservations
        const deleteResult = await prisma.stockReservation.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
                orderId: null,
            },
        });

        logger.info(`Cleaned up ${deleteResult.count} expired reservations`);

        return NextResponse.json({
            cleaned: deleteResult.count,
            restored: expiredReservations.map((r) => ({
                creationId: r.creationId,
                quantity: r.quantity,
            })),
        });
    } catch (error) {
        logger.error("Error in cleanup-reservations cron", error);
        return NextResponse.json(
            { error: "Cleanup failed" },
            { status: 500 }
        );
    }
}
