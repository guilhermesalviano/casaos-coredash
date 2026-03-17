import { gunzipSync, gzipSync } from "zlib";

/**
 * interface CacheEntry<T> { data: T; expiresAt: number; }
 * Volatility: The cache is lost on every server restart
 * Single instance only: If you ever scale to multiple Node.js processes
 * @param ttlMs 
 * @returns T
 */
export function createMemoryCache<T>(ttlMs: number) {
  let cache: { data: Buffer; expiresAt: number } | null = null;

  return {
    get(): T | null {
      if (!cache || Date.now() > cache.expiresAt) {
        cache = null;
        return null;
      }
      return JSON.parse(gunzipSync(cache.data).toString());
    },
    set(data: T): void {
      cache = {
        data: gzipSync(Buffer.from(JSON.stringify(data))),
        expiresAt: Date.now() + ttlMs,
      };
    },
  };
}