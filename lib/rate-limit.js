// Simple in-memory rate limiter for Vercel serverless
// Maps IP -> { count, resetTime }

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 25; // 25 requests per minute per IP (supports batch loading)

export function getRateLimitStatus(ip) {
  const now = Date.now();
  let limiter = rateLimitMap.get(ip);

  if (!limiter || now > limiter.resetTime) {
    // Create or reset
    limiter = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    rateLimitMap.set(ip, limiter);
  }

  limiter.count++;

  return {
    count: limiter.count,
    limit: MAX_REQUESTS_PER_WINDOW,
    remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - limiter.count),
    resetTime: limiter.resetTime,
    isLimited: limiter.count > MAX_REQUESTS_PER_WINDOW,
  };
}

export function getClientIp(request) {
  // Vercel provides x-forwarded-for header
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('cf-connecting-ip') || 'unknown';
}
