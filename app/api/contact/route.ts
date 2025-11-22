import { NextResponse } from "next/server";
import { z } from "zod";

// Schema de validation pour le formulaire de contact
const contactSchema = z.object({
    name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
    email: z.string().email({ message: "Adresse email invalide" }),
    message: z.string().min(10, { message: "Le message doit contenir au moins 10 caractères" }),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Valider les données
        const result = contactSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Données invalides", details: result.error.format() },
                { status: 400 }
            );
        }

        const { name, email, message } = result.data;

        // Ici, vous connecteriez normalement un service d'envoi d'email (Resend, SendGrid, etc.)
        // ou vous enregistreriez le message dans la base de données.
        // Pour l'instant, nous allons simuler un succès et logger les données.



        // Simulation d'un délai réseau
        await new Promise((resolve) => setTimeout(resolve, 500));

        return NextResponse.json(
            { success: true, message: "Message envoyé avec succès" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erreur lors du traitement du formulaire de contact:", error);
        return NextResponse.json(
            { error: "Une erreur est survenue lors de l'envoi du message" },
            { status: 500 }
        );
    }
}
