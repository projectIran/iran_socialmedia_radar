/**
 * Rate limiter to prevent spam
 * Limits users to maxRequests requests per timeWindow milliseconds
 */
class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 60000) {
    // maxRequests: maximum number of requests allowed
    // timeWindow: time window in milliseconds (default: 60000 = 1 minute)
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.userRequests = new Map(); // userId -> array of timestamps
  }

  /**
   * Check if user can make a request
   * @param {number} userId - User ID
   * @returns {object} - { allowed: boolean, remaining: number, resetAt: number }
   */
  checkLimit(userId) {
    const now = Date.now();
    let userTimestamps = this.userRequests.get(userId) || [];

    // Remove timestamps older than timeWindow
    userTimestamps = userTimestamps.filter(
      timestamp => now - timestamp < this.timeWindow
    );

    // Check if user has exceeded limit
    if (userTimestamps.length >= this.maxRequests) {
      const oldestRequest = userTimestamps[0];
      const resetAt = oldestRequest + this.timeWindow;
      const remaining = Math.ceil((resetAt - now) / 1000); // seconds until reset

      return {
        allowed: false,
        remaining,
        resetAt,
        count: userTimestamps.length,
      };
    }

    // Add current request timestamp
    userTimestamps.push(now);
    this.userRequests.set(userId, userTimestamps);

    // Clean up old entries periodically (every 5 minutes)
    if (Math.random() < 0.01) { // 1% chance on each request
      this.cleanup();
    }

    return {
      allowed: true,
      remaining: this.maxRequests - userTimestamps.length,
      resetAt: now + this.timeWindow,
      count: userTimestamps.length,
    };
  }

  /**
   * Clean up old entries to prevent memory leak
   */
  cleanup() {
    const now = Date.now();
    for (const [userId, timestamps] of this.userRequests.entries()) {
      const validTimestamps = timestamps.filter(
        timestamp => now - timestamp < this.timeWindow
      );
      
      if (validTimestamps.length === 0) {
        this.userRequests.delete(userId);
      } else {
        this.userRequests.set(userId, validTimestamps);
      }
    }
  }

  /**
   * Reset rate limit for a user (useful for testing or admin actions)
   * @param {number} userId - User ID
   */
  reset(userId) {
    this.userRequests.delete(userId);
  }
}

// Create a singleton instance
// Max 10 requests per minute (60000 milliseconds)
export const rateLimiter = new RateLimiter(10, 60000);

export default RateLimiter;
