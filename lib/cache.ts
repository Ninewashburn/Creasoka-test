type CacheItem<T> = {
  data: T;
  expiry: number;
};

class ServerCache {
  private cache: Map<string, CacheItem<unknown>> = new Map();

  // Durée par défaut : 5 minutes
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 5 * 60 * 1000
  ): Promise<T> {
    const now = Date.now();
    const cachedItem = this.cache.get(key);

    if (cachedItem && cachedItem.expiry > now) {
      return cachedItem.data as T;
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      expiry: now + ttl,
    });

    return data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}

export const serverCache = new ServerCache();
