/**
 * In-memory rate limiter by key (e.g. IP or session id).
 * Limits to maxRequests per timeWindow ms.
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  count: number;
}

export class RateLimiter {
  private maxRequests: number;
  private timeWindow: number;
  private keyTimestamps = new Map<string, number[]>();

  constructor(maxRequests = 10, timeWindowMs = 60_000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  /**
   * Check if key can make a request. If allowed, records the request.
   * @param key - Identifier (e.g. IP string or session id).
   */
  checkLimit(key: string): RateLimitResult {
    const now = Date.now();
    let timestamps = this.keyTimestamps.get(key) ?? [];
    timestamps = timestamps.filter((t) => now - t < this.timeWindow);

    if (timestamps.length >= this.maxRequests) {
      const oldest = timestamps[0];
      const resetAt = oldest + this.timeWindow;
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        count: timestamps.length,
      };
    }

    timestamps.push(now);
    this.keyTimestamps.set(key, timestamps);

    if (Math.random() < 0.01) this.cleanup();

    return {
      allowed: true,
      remaining: this.maxRequests - timestamps.length,
      resetAt: now + this.timeWindow,
      count: timestamps.length,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, timestamps] of this.keyTimestamps.entries()) {
      const valid = timestamps.filter((t) => now - t < this.timeWindow);
      if (valid.length === 0) this.keyTimestamps.delete(key);
      else this.keyTimestamps.set(key, valid);
    }
  }

  reset(key: string): void {
    this.keyTimestamps.delete(key);
  }
}

/** Default: 10 requests per minute. Use for generate-email or similar. */
export const defaultRateLimiter = new RateLimiter(10, 60_000);
