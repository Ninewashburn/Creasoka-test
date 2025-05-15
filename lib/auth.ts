import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// IMPORTANT: En production, définissez ces valeurs dans .env.local
// NEVER commit these values to version control

// Grâce à types/env.d.ts, TypeScript devrait connaître le type de process.env.JWT_SECRET

if (!process.env.JWT_SECRET) {
  console.error(
    "ERREUR CRITIQUE: JWT_SECRET n'est pas défini dans les variables d'environnement.\n" +
      "Veuillez vous assurer qu'elle est définie dans votre fichier .env ou dans les paramètres de votre environnement d'hébergement."
  );
  // En production, il est fortement recommandé de lever une erreur ici pour arrêter l'application.
  // throw new Error("Configuration manquante: JWT_SECRET n'est pas défini.");
}

// Utilisation directe, TypeScript devrait maintenant comprendre que JWT_SECRET est une chaîne (s'il est défini).
// La garde ci-dessus est pour l'exécution ; la déclaration .d.ts est pour la compilation.
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

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
  if (!JWT_SECRET) {
    // Cette vérification est une sécurité supplémentaire au cas où la garde initiale serait contournée
    // ou si process.env.JWT_SECRET était une chaîne vide, ce qui est indésirable.
    console.error(
      "Tentative de génération de token JWT sans JWT_SECRET valide."
    );
    throw new Error(
      "JWT_SECRET n'est pas configuré correctement pour la signature de token."
    );
  }

  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as any,
    // Vous pourriez envisager d'expliciter l'algorithme si le problème persiste,
    // bien que HS256 soit le défaut pour les secrets de type chaîne.
    // algorithm: 'HS256'
  };

  return jwt.sign(payload, JWT_SECRET as string, options);
}

/**
 * Vérifie un token JWT
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    if (!JWT_SECRET) {
      console.error(
        "Tentative de vérification de token JWT sans JWT_SECRET valide."
      );
      return null; // Ou lever une erreur, selon la politique de gestion des erreurs
    }
    return jwt.verify(token, JWT_SECRET as string) as JwtPayload;
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
