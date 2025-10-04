// Simple in-memory cache for analytics data
const analyticsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCachedAnalytics(key: string): any | null {
  const cached = analyticsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

export function setCachedAnalytics(key: string, data: any): void {
  analyticsCache.set(key, { data, timestamp: Date.now() });
}

export function clearAnalyticsCache(): void {
  analyticsCache.clear();
}
