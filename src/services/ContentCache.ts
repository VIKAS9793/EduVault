/**
 * Modern Content Cache Service
 * Implements multi-layer caching with intelligent invalidation
 * Inspired by Netflix, Spotify, and Google's content delivery systems
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
  etag?: string;
  lastModified?: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
}

class ContentCache {
  private memoryCache = new Map<string, CacheEntry<any>>();

  private readonly MAX_MEMORY_SIZE = 100; // Maximum entries in memory cache

  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  private readonly LONG_TTL = 60 * 60 * 1000; // 1 hour for static content

  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    hitRate: 0,
  };

  /**
   * Get data from cache with intelligent fallback
   */
  async get<T>(key: string, options?: {
    maxAge?: number;
    fallback?: () => Promise<T>;
    forceRefresh?: boolean;
  }): Promise<T | null> {
    const entry = this.memoryCache.get(key);

    if (!entry || options?.forceRefresh) {
      this.stats.misses++;
      this.updateHitRate();

      if (options?.fallback) {
        const data = await options.fallback();
        this.set(key, data, { ttl: options.maxAge || this.DEFAULT_TTL });
        return data;
      }
      return null;
    }

    // Check if entry is expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key);
      this.stats.misses++;
      this.updateHitRate();

      if (options?.fallback) {
        const data = await options.fallback();
        this.set(key, data, { ttl: options.maxAge || this.DEFAULT_TTL });
        return data;
      }
      return null;
    }

    this.stats.hits++;
    this.updateHitRate();
    return entry.data as T;
  }

  /**
   * Set data in cache with metadata
   */
  set<T>(key: string, data: T, options?: {
    ttl?: number;
    version?: string;
    etag?: string;
    lastModified?: string;
  }): void {
    // Implement LRU eviction if cache is full
    if (this.memoryCache.size >= this.MAX_MEMORY_SIZE) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: options?.ttl || this.DEFAULT_TTL,
      version: options?.version || '1.0.0',
      etag: options?.etag,
      lastModified: options?.lastModified,
    };

    this.memoryCache.set(key, entry);
    this.stats.size = this.memoryCache.size;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidate(pattern: string | RegExp): void {
    const keysToDelete: string[] = [];

    for (const key of this.memoryCache.keys()) {
      if (typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.memoryCache.delete(key);
      this.stats.evictions++;
    });

    this.stats.size = this.memoryCache.size;
  }

  /**
   * Invalidate all cache entries
   */
  clear(): void {
    this.memoryCache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      hitRate: 0,
    };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Check if content needs refresh based on version/etag
   */
  needsRefresh(key: string, currentVersion?: string, currentEtag?: string): boolean {
    const entry = this.memoryCache.get(key);
    if (!entry) return true;

    if (currentVersion && entry.version !== currentVersion) return true;
    if (currentEtag && entry.etag !== currentEtag) return true;

    return false;
  }

  /**
   * Preload critical content
   */
  async preload<T>(key: string, loader: () => Promise<T>, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
    try {
      const data = await loader();
      const ttl = priority === 'high' ? this.LONG_TTL : this.DEFAULT_TTL;
      this.set(key, data, { ttl });
    } catch (error) {
      console.warn(`Failed to preload ${key}:`, error);
    }
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmup(loaders: Array<{ key: string; loader: () => Promise<any>; priority?: 'high' | 'medium' | 'low' }>): Promise<void> {
    const promises = loaders.map(({ key, loader, priority = 'medium' }) => this.preload(key, loader, priority));

    await Promise.allSettled(promises);
  }

  /**
   * LRU eviction implementation
   */
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * Update hit rate statistics
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

export const contentCache = new ContentCache();
