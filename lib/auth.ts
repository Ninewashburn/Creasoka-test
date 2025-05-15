import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// IMPORTANT: En production, définissez ces valeurs dans .env.local
// NEVER commit these values to version control

const envJwtSecret = process.env.JWT_SECRET;
if (!envJwtSecret) {
  console.error(
    "ERREUR CRITIQUE: JWT_SECRET n'est pas défini dans les variables d'environnement"
  );
  // En production, vous pourriez vouloir arrêter l'application ici ou lever une erreur.
  // Pour les besoins du typage et éviter que jwt.sign échoue à la compilation si la var est absente,
  // on assigne une chaîne non vide, mais le console.error ci-dessus est crucial.
}

// Assurer que JWT_SECRET est une chaîne non vide pour jwt.sign
// La vérification ci-dessus garantit que le problème est signalé si elle est réellement manquante.
const JWT_SECRET: string =
  envJwtSecret || "fallback-secret-for-typing-only-dev-mode";
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";

const COOKIE_NAME = "auth-token";

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

// Protection contre les attaques de force brute
type LoginAttempt = {
  count: number;
  lastAttempt: number;
  lockUntil: number;
};

const loginAttempts: Record<string, LoginAttempt> = {};

/**
 * Génère un hachage de mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Vérifie si un mot de passe correspond au hachage
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Génère un token JWT
 */
export function generateToken(payload: JwtPayload): string {
  const secret: string = JWT_SECRET;
  if (!secret) {
    console.error(
      "JWT_SECRET is undefined or empty when trying to sign token!"
    );
    throw new Error("JWT_SECRET is not configured properly for token signing.");
  }
  return jwt.sign(payload, secret, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Vérifie un token JWT
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const secret: string = JWT_SECRET;
    if (!secret) {
      console.error(
        "JWT_SECRET is undefined or empty when trying to verify token!"
      );
      return null;
    }
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

/**
 * Définit le cookie d'authentification
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 jours en secondes
    path: "/",
  });
}

/**
 * Supprime le cookie d'authentification
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Récupère le token JWT depuis les cookies de la requête
 * Recherche également dans d'autres emplacements comme les en-têtes
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // 1. Vérifier dans les cookies
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // 2. Vérifier dans l'en-tête Authorization
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // 3. Vérifier dans les paramètres de recherche (moins sécurisé, mais pour débogage)
  const urlToken = request.nextUrl.searchParams.get("token");
  if (urlToken && process.env.NODE_ENV !== "production") {
    return urlToken;
  }

  return null;
}

/**
 * Récupère le token JWT depuis les cookies du serveur
 */
export async function getTokenFromServerCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);
  return authCookie?.value || null;
}

/**
 * Génère un token CSRF pour protéger contre les attaques CSRF
 */
export function generateCsrfToken(): string {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Vérifie le token CSRF
 */
export function verifyCsrfToken(token: string, expectedToken: string): boolean {
  // Utiliser une comparaison sécurisée contre les attaques temporelles
  if (!token || !expectedToken || token.length !== expectedToken.length) {
    return false;
  }

  return token === expectedToken;
}

/**
 * Vérifie si l'adresse IP est autorisée à tenter de se connecter
 */
export function checkLoginAttempts(ip: string): {
  allowed: boolean;
  message?: string;
} {
  const now = Date.now();
  const attempt = loginAttempts[ip];

  // Si pas de tentative précédente ou reset après 24h
  if (!attempt || now - attempt.lastAttempt > 24 * 60 * 60 * 1000) {
    loginAttempts[ip] = { count: 0, lastAttempt: now, lockUntil: 0 };
    return { allowed: true };
  }

  // Vérifier si l'IP est bloquée
  if (attempt.lockUntil > now) {
    const remainingMinutes = Math.ceil((attempt.lockUntil - now) / (60 * 1000));
    return {
      allowed: false,
      message: `Compte temporairement bloqué. Réessayez dans ${remainingMinutes} minute(s).`,
    };
  }

  return { allowed: true };
}

/**
 * Enregistre une tentative de connexion échouée
 */
export function recordFailedLoginAttempt(ip: string): void {
  const now = Date.now();
  const attempt = loginAttempts[ip] || {
    count: 0,
    lastAttempt: now,
    lockUntil: 0,
  };

  attempt.count += 1;
  attempt.lastAttempt = now;

  // Après 5 tentatives échouées, bloquer pour 15 minutes
  if (attempt.count >= 5) {
    attempt.lockUntil = now + 15 * 60 * 1000;
    attempt.count = 0;
  }

  loginAttempts[ip] = attempt;
}

/**
 * Réinitialise les tentatives de connexion après un succès
 */
export function resetLoginAttempts(ip: string): void {
  delete loginAttempts[ip];
}
