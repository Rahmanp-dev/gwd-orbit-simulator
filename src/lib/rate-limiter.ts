/**
 * High-performance Sliding-Window Memory Rate Limiter
 * Restricts API request frequencies per key (IP / User ID) to prevent spamming.
 */
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 60 seconds
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000);
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 30,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetMs: number } {
  const now = Date.now();

  // Inline prune mechanism for serverless envs where setInterval is unreliable
  if (rateLimitStore.size > 2000) {
    for (const [k, r] of rateLimitStore.entries()) {
      r.timestamps = r.timestamps.filter((ts) => now - ts < windowMs);
      if (r.timestamps.length === 0) {
        rateLimitStore.delete(k);
      }
    }
  }

  let record = rateLimitStore.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const resetMs = windowMs - (now - oldest);
    return { success: false, remaining: 0, resetMs };
  }

  record.timestamps.push(now);
  return {
    success: true,
    remaining: maxRequests - record.timestamps.length,
    resetMs: windowMs,
  };
}
