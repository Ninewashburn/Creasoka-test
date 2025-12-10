/**
 * Client-side Logger
 *
 * Logger sécurisé pour les composants React côté client.
 * En production, les logs sont silencieux pour éviter d'exposer des informations sensibles.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const clientLogger = {
  /**
   * Log une erreur (seulement en développement)
   */
  error: (message: string, error?: Error | unknown, context?: Record<string, any>) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context);
    }
    // En production, on pourrait envoyer à un service de monitoring client-side
    // comme Sentry Browser SDK si configuré
  },

  /**
   * Log un warning (seulement en développement)
   */
  warn: (message: string, context?: Record<string, any>) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, context);
    }
  },

  /**
   * Log une info (seulement en développement)
   */
  info: (message: string, context?: Record<string, any>) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, context);
    }
  },

  /**
   * Log pour debug (seulement en développement)
   */
  debug: (message: string, context?: Record<string, any>) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, context);
    }
  },
};
