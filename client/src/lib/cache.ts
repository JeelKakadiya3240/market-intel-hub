/**
 * IndexedDB Cache Utility for Fast Chart Data Loading
 * Provides instant loading from cache while refreshing data in background
 */

interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  version: string;
}

class ChartDataCache {
  private dbName = 'MarketIntelligenceCache';
  private version = 1;
  private storeName = 'analytics';
  private db: IDBDatabase | null = null;

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Store data in cache with timestamp
   */
  async set<T>(key: string, data: T): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const entry: CacheEntry<T> = {
        key,
        data,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      const request = store.put(entry);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get data from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as CacheEntry<T> | undefined;
        resolve(result ? result.data : null);
      };
    });
  }

  /**
   * Check if cached data exists and is recent (within 1 hour)
   */
  async isValid(key: string, maxAge: number = 3600000): Promise<boolean> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as CacheEntry<any> | undefined;
        if (!result) {
          resolve(false);
          return;
        }
        
        const isRecent = (Date.now() - result.timestamp) < maxAge;
        resolve(isRecent);
      };
    });
  }

  /**
   * Clear old cache entries (older than 24 hours)
   */
  async cleanup(): Promise<void> {
    if (!this.db) await this.init();
    
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(cutoff));
      
      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  /**
   * Fallback to localStorage for smaller datasets
   */
  setLocalStorage<T>(key: string, data: T): void {
    try {
      const entry = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to store in localStorage:', error);
    }
  }

  /**
   * Get from localStorage fallback
   */
  getLocalStorage<T>(key: string, maxAge: number = 3600000): T | null {
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (!stored) return null;
      
      const entry = JSON.parse(stored);
      const isRecent = (Date.now() - entry.timestamp) < maxAge;
      
      return isRecent ? entry.data : null;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }
}

// Export singleton instance
export const chartCache = new ChartDataCache();

// Cache keys for different analytics endpoints
export const CACHE_KEYS = {
  STARTUPS_ANALYTICS: 'startups_analytics',
  GROWTH_ANALYTICS: 'growth_analytics', 
  FRANCHISES_ANALYTICS: 'franchises_analytics',
  VC_ANALYTICS: 'vc_analytics',
} as const;

/**
 * Hook for cache-first data loading with background refresh
 */
export async function useCachedData<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  maxAge: number = 3600000 // 1 hour default
): Promise<{
  data: T | null;
  isFromCache: boolean;
  refresh: () => Promise<T>;
}> {
  // Try to get cached data first
  let cachedData: T | null = null;
  let isFromCache = false;

  try {
    // Try IndexedDB first
    cachedData = await chartCache.get<T>(cacheKey);
    if (cachedData && await chartCache.isValid(cacheKey, maxAge)) {
      isFromCache = true;
    } else {
      // Fallback to localStorage
      cachedData = chartCache.getLocalStorage<T>(cacheKey, maxAge);
      if (cachedData) {
        isFromCache = true;
      }
    }
  } catch (error) {
    console.warn('Cache read error, falling back to localStorage:', error);
    cachedData = chartCache.getLocalStorage<T>(cacheKey, maxAge);
    if (cachedData) {
      isFromCache = true;
    }
  }

  // Refresh function to fetch new data
  const refresh = async (): Promise<T> => {
    const freshData = await fetchFn();
    
    // Cache the fresh data
    try {
      await chartCache.set(cacheKey, freshData);
    } catch (error) {
      console.warn('Failed to cache to IndexedDB, using localStorage:', error);
      chartCache.setLocalStorage(cacheKey, freshData);
    }
    
    return freshData;
  };

  return {
    data: cachedData,
    isFromCache,
    refresh
  };
}

// Initialize cache and cleanup on app start
chartCache.init().then(() => {
  chartCache.cleanup();
});