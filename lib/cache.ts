interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class TTLCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private ttl: number;

  constructor(ttlMs: number) {
    this.ttl = ttlMs;
    // Auto-purge every 10 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.purge(), 10 * 60 * 1000);
    }
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttl });
  }

  private purge(): void {
    const now = Date.now();
    this.store.forEach((entry, key) => {
      if (now > entry.expiresAt) this.store.delete(key);
    });
  }
}

// Singleton caches (survive across requests in the same Node.js process)
export const repoCache = new TTLCache<string>(8 * 60 * 1000);
export const analysisCache = new TTLCache<string>(8 * 60 * 1000);
