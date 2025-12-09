import { NextResponse } from "next/server";
import { z } from "zod";
import { headers } from "next/headers";
import { checkLoginAttempts, validateOrigin } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

// Schema de validation pour le formulaire de contact
const contactSchema = z.object({
    name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
    email: z.string().email({ message: "Adresse email invalide" }),
    message: z.string().min(10, { message: "Le message doit contenir au moins 10 caractères" }),
});

export async function POST(request: Request) {
    try {
        const headersList = await headers();
        const forwardedFor = headersList.get("x-forwarded-for");
        const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown";

        const attemptCheck = await checkLoginAttempts(clientIp);
        if (!attemptCheck.allowed) {
            return NextResponse.json(
                { error: attemptCheck.message || "Trop de tentatives" },
                { status: 429 }
            );
        }

        // CSRF Protection
        if (!validateOrigin(headersList)) {
            return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
        }

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

        // Envoyer l'email
        const emailSuccess = await sendEmail({
            to: process.env.ADMIN_EMAIL || "contact@creasoka.com", // Votre adresse admin
            subject: `Nouveau message de contact : ${name}`,
            text: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
                <h1>Nouveau message de contact</h1>
                <p><strong>Nom:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <h2>Message:</h2>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
                    ${message.replace(/\n/g, '<br>')}
                </div>
            `
        });

        if (!emailSuccess) {
            // En prod, si ça échoue, on peut vouloir le signaler ou logguer
            console.error("Échec de l'envoi du message de contact");
            return NextResponse.json(
                { error: "Erreur technique lors de l'envoi. Veuillez réessayer plus tard." },
                { status: 500 }
            );
        }

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
