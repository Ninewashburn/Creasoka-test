import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";
import { z } from "zod";
import { headers } from "next/headers";
import { checkLoginAttempts } from "@/lib/auth";
import { logger } from "@/lib/sentry";

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

    const { email } = await request.json();

    // Validation de l'email avec Zod
    const emailSchema = z.string().email("Email invalide");
    const result = emailSchema.safeParse(email);

    if (!result.success) {
      return NextResponse.json(
        { error: "Email invalide" },
        { status: 400 }
      );
    }

    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Pour la sécurité, on retourne toujours un succès même si l'email n'existe pas
    // Cela empêche l'énumération des comptes
    if (!user) {
      logger.warn("Tentative de réinitialisation pour email inexistant");
      return NextResponse.json(
        {
          message:
            "Si cet email existe dans notre base de données, vous recevrez un lien de réinitialisation.",
        },
        { status: 200 }
      );
    }

    // Supprimer les anciens tokens non utilisés pour cet utilisateur
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        OR: [
          { expiresAt: { lt: new Date() } }, // Expirés
          { used: true }, // Déjà utilisés
        ],
      },
    });

    // Générer un token sécurisé (plain text pour l'email)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash le token avec SHA-256 avant stockage (sécurité)
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Créer le token de réinitialisation (expire dans 1 heure)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await prisma.passwordResetToken.create({
      data: {
        token: tokenHash, // Stocker le hash, pas le token plain
        userId: user.id,
        expiresAt,
      },
    });

    // Envoyer l'email de réinitialisation
    const emailSent = await sendPasswordResetEmail(
      user.email,
      resetToken,
      user.name || undefined
    );

    if (!emailSent) {
      logger.error("Échec de l'envoi de l'email de réinitialisation");
      // On ne retourne pas d'erreur à l'utilisateur pour ne pas révéler d'informations
    }

    return NextResponse.json(
      {
        message:
          "Si cet email existe dans notre base de données, vous recevrez un lien de réinitialisation.",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Erreur dans forgot-password", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
