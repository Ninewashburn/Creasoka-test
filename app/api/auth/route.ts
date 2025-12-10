import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateToken,
  setAuthCookie,
  removeAuthCookie,
  getTokenFromServerCookies,
  verifyToken,
  verifyPassword,
  checkLoginAttempts,
  recordFailedLoginAttempt,
  resetLoginAttempts,
  validateOrigin,
} from "@/lib/auth";
import { headers } from "next/headers";
import { logger } from "@/lib/sentry";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Récupérer l'adresse IP du client
    const headersList = await headers();

    // CSRF Protection: Vérifier l'origine (Origin Check)
    const origin = headersList.get("origin");
    const host = headersList.get("host");

    // En production, on vérifie que l'origine correspond au host
    if (process.env.NODE_ENV === "production" && origin) {
      const allowedOrigin = `https://${host}`;
      if (origin !== allowedOrigin) {
        return NextResponse.json(
          { success: false, message: "CSRF: Origine non autorisée" },
          { status: 403 }
        );
      }
    }

    const forwardedFor = headersList.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0] : "unknown";

    // Vérifier si l'adresse IP n'est pas bloquée
    const attemptCheck = await checkLoginAttempts(clientIp);
    if (!attemptCheck.allowed) {
      return NextResponse.json(
        { success: false, message: attemptCheck.message },
        { status: 429 } // Too Many Requests
      );
    }

    // Vérifier que les champs requis sont présents
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Rechercher l'utilisateur dans la base de données
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Vérifier si l'utilisateur existe
    if (!user) {
      await recordFailedLoginAttempt(clientIp);
      return NextResponse.json(
        { success: false, message: "Identifiants incorrects" },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      await recordFailedLoginAttempt(clientIp);
      return NextResponse.json(
        { success: false, message: "Identifiants incorrects" },
        { status: 401 }
      );
    }

    // Réinitialiser les tentatives après une connexion réussie
    await resetLoginAttempts(clientIp);

    // Générer un token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Définir le cookie d'authentification
    await setAuthCookie(token);

    // Retourner les informations de l'utilisateur
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Erreur d'authentification", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de l'authentification" },
      { status: 500 }
    );
  }
}

// Vérification de l'état d'authentification
export async function GET() {
  try {
    // Récupérer le token depuis les cookies
    const token = await getTokenFromServerCookies();

    if (!token) {
      // Réponse normale quand l'utilisateur n'est pas connecté
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Vérifier le token
    const payload = verifyToken(token);
    if (!payload) {
      // Token invalide ou expiré
      await removeAuthCookie();
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Vérifier que l'utilisateur existe toujours en base de données
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      // L'utilisateur n'existe plus
      await removeAuthCookie();
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // L'utilisateur est authentifié
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error("Erreur de vérification d'authentification", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

// Déconnexion
export async function DELETE() {
  await removeAuthCookie();
  return NextResponse.json({ success: true });
}
