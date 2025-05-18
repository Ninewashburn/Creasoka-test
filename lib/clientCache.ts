// Fonctions utilitaires pour gérer le cache côté client
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes par défaut

export function getFromCache<T>(key: string): T | null {
  try {
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return null;

    const { data, timestamp } = JSON.parse(cachedData);

    // Vérifier si le cache est encore valide
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }

    // Cache expiré, le supprimer
    localStorage.removeItem(key);
    return null;
  } catch (error) {
    console.error(
      `Erreur lors de la récupération du cache pour ${key}:`,
      error
    );
    return null;
  }
}

export function setToCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error(`Erreur lors de la mise en cache pour ${key}:`, error);
  }
}

export function invalidateCache(key: string): void {
  localStorage.removeItem(key);
}

export function invalidateAllCache(): void {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    try {
      const item = localStorage.getItem(key);
      if (item && item.includes('"timestamp":')) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      // Ignorer les erreurs pour les clés qui ne sont pas accessibles
    }
  });
}
