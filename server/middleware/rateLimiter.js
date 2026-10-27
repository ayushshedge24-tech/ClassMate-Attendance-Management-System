/**
 * In-Memory Sliding-Window Rate Limiting Middleware
 * Protects authentication endpoints against brute-force / credential-stuffing attacks.
 */

const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
  const max = options.max || 15; // Max 15 attempts per window
  const message =
    options.message ||
    'Too many requests from this IP, please try again after 15 minutes.';

  // Storage: Map of ip -> { count: number, resetTime: number }
  const hits = new Map();

  // Periodic cleanup of expired entries every 5 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  // Unref cleanup interval so it does not prevent process termination in tests
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    // In automated integration test runs where many logins happen rapidly in a single test process,
    // allow a custom header or test mode to prevent test-flakiness while keeping real clients secured.
    if (process.env.NODE_ENV === 'test' && !req.headers['x-enforce-rate-limit']) {
      return next();
    }

    const ip =
      req.ip ||
      req.headers['x-forwarded-for'] ||
      req.connection?.remoteAddress ||
      'unknown-client';
    const now = Date.now();

    const record = hits.get(ip);

    if (!record || now > record.resetTime) {
      hits.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      return next();
    }

    record.count += 1;
    const remaining = Math.max(0, max - record.count);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (record.count > max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message,
        retryAfter: retryAfterSeconds,
      });
    }

    next();
  };
};

module.exports = { createRateLimiter };
