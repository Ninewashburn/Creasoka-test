/**
 * Logger utilitaire pour gérer les logs de manière conditionnelle
 * Les logs de debug ne s'affichent qu'en mode développement
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log de debug - Affiché uniquement en développement
   */
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Log d'information - Affiché uniquement en développement
   */
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Log d'avertissement - Toujours affiché
   */
  warn: (...args: unknown[]): void => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Log d'erreur - Toujours affiché
   */
  error: (...args: unknown[]): void => {
    console.error('[ERROR]', ...args);
  },
};

export default logger;
