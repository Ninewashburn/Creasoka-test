/**
 * Sentry Error Logging Configuration
 *
 * Pour activer Sentry en production:
 * 1. Créer un compte sur sentry.io
 * 2. Créer un nouveau projet Next.js
 * 3. Ajouter SENTRY_DSN dans .env
 * 4. Décommenter l'initialisation Sentry.init ci-dessous
 */

import * as Sentry from "@sentry/nextjs";

// Initialiser Sentry seulement en production et si SENTRY_DSN est configuré
if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1, // 10% des transactions pour performance monitoring
    environment: process.env.NODE_ENV,
    enabled: true,
  });
}

/**
 * Logger sécurisé qui utilise Sentry en production et console en développement
 */
export const logger = {
  /**
   * Log une erreur critique
   */
  error: (message: string, error?: Error | unknown, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
      // En production avec Sentry configuré
      Sentry.captureException(error || new Error(message), {
        extra: context,
        tags: {
          level: "error",
        },
      });
    } else {
      // En développement ou sans Sentry
      console.error(`[ERROR] ${message}`, error, context);
    }
  },

  /**
   * Log un warning
   */
  warn: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
      Sentry.captureMessage(message, {
        level: "warning",
        extra: context,
      });
    } else {
      console.warn(`[WARN] ${message}`, context);
    }
  },

  /**
   * Log une info (pas envoyé à Sentry)
   */
  info: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[INFO] ${message}`, context);
    }
  },

  /**
   * Log pour debug (seulement en dev)
   */
  debug: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEBUG] ${message}`, context);
    }
  },
};

export { Sentry };
