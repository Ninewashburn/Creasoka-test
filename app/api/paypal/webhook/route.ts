import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Webhook PayPal simple pour l'instant.
// À terme, il faut vérifier la signature du webhook pour la sécurité.

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const eventType = body.event_type;
        const resource = body.resource;

        console.log(`Webhook PayPal reçu: ${eventType}`);

        if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
            // Le paiement a réussi
            // resource.supplementary_data.related_ids.order_id contient l'ID de commande PayPal
            const paypalOrderId = resource.supplementary_data?.related_ids?.order_id || resource.id;
            // Note: La structure varie selon l'event. Pour CAPTURE.COMPLETED, resource est la capture.

            // Si on stocke le paymentId (PayPal Order ID) dans notre DB, on peut retrouver la commande.
            // Mais attention, ici on reçoit souvent l'ID de la CAPTURE, pas de l'ORDER.
            // Il faut faire le lien. Pour l'instant, loggons juste.

            console.log("Détails paiement:", resource);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Erreur Webhook PayPal:", error);
        return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
    }
}
