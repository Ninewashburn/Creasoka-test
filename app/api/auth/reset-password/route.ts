import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const passwordSchema = z.string()
  .min(12, "Le mot de passe doit contenir au moins 12 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre")
  .regex(/[\W_]/, "Le mot de passe doit contenir un caractère spécial");

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    // Validation
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token requis" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Mot de passe requis" },
        { status: 400 }
      );
    }

    // Validation du mot de passe avec Zod
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      return NextResponse.json(
        { error: passwordResult.error.errors[0].message },
        { status: 400 }
      );
    }

    // Rechercher le token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    // Vérifier que le token existe
    if (!resetToken) {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 400 }
      );
    }

    // Vérifier que le token n'a pas déjà été utilisé
    if (resetToken.used) {
      return NextResponse.json(
        { error: "Ce lien a déjà été utilisé" },
        { status: 400 }
      );
    }

    // Vérifier que le token n'est pas expiré
    if (resetToken.expiresAt < new Date()) {
      // Supprimer le token expiré
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return NextResponse.json(
        { error: "Ce lien a expiré. Veuillez demander un nouveau lien de réinitialisation." },
        { status: 400 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await hashPassword(password);

    // Mettre à jour le mot de passe de l'utilisateur
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Marquer le token comme utilisé
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    // Supprimer tous les autres tokens de réinitialisation pour cet utilisateur
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: resetToken.userId,
        id: { not: resetToken.id },
      },
    });

    return NextResponse.json(
      { message: "Votre mot de passe a été réinitialisé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur dans reset-password:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
