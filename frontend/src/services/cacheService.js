const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class CacheService {
    constructor() {
        this.cache = new Map();
    }

    set(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    clear() {
        this.cache.clear();
    }

    invalidate(key) {
        this.cache.delete(key);
    }

    invalidatePattern(prefix) {
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        }
    }
}

export const cacheService = new CacheService();
