/**
 * Rate Limiting Middleware
 * 
 * Protects API endpoints from abuse by limiting requests per IP address.
 * Demo users: 100 requests/hour globally, 10 messages per session
 * Authenticated subscribers: Unlimited
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (consider Redis for production scale)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Session message count tracking
const sessionMessageCounts = new Map<string, number>();

/**
 * Clean up expired rate limit entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}, 5 * 60 * 1000);

/**
 * Get client IP address from request
 */
function getClientIp(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Check if request should be rate limited
 * @param identifier - Unique identifier (IP address or fingerprint)
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed status and remaining count
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: limit - 1, resetTime };
  }

  if (entry.count >= limit) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);
  return { allowed: true, remaining: limit - entry.count, resetTime: entry.resetTime };
}

/**
 * Check demo chat message rate limit per session
 * @param fingerprint - Browser fingerprint
 * @param limit - Maximum messages per session (default 10)
 * @returns Object with allowed status and remaining count
 */
export function checkDemoMessageLimit(
  fingerprint: string,
  limit: number = 10
): { allowed: boolean; remaining: number } {
  const count = sessionMessageCounts.get(fingerprint) || 0;

  if (count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  sessionMessageCounts.set(fingerprint, count + 1);
  return { allowed: true, remaining: limit - count - 1 };
}

/**
 * Reset demo message count for a session (used when user clears history)
 */
export function resetDemoMessageCount(fingerprint: string): void {
  sessionMessageCounts.delete(fingerprint);
}

/**
 * Express middleware for rate limiting demo endpoints
 */
export function demoChatRateLimiter(req: any, res: any, next: any) {
  const ip = getClientIp(req);
  const { allowed, remaining, resetTime } = checkRateLimit(
    `demo:${ip}`,
    100, // 100 requests per hour
    60 * 60 * 1000 // 1 hour
  );

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', '100');
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());

  if (!allowed) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      resetTime: new Date(resetTime).toISOString(),
    });
  }

  next();
}

/**
 * Get rate limit stats for monitoring
 */
export function getRateLimitStats() {
  return {
    totalEntries: rateLimitStore.size,
    sessionMessageCounts: sessionMessageCounts.size,
  };
}
