import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 40; // Max 40 requests per minute per IP

const ipStore = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipStore.entries()) {
    if (now > record.resetTime) {
      ipStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export function basicRateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown-client';
  const now = Date.now();

  const record = ipStore.get(clientIp);

  if (!record || now > record.resetTime) {
    ipStore.set(clientIp, {
      count: 1,
      resetTime: now + WINDOW_MS
    });
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS - 1);
    return next();
  }

  if (record.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfterSeconds);
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', 0);
    return res.status(429).json({
      error: 'Rate limit exceeded.',
      details: `Too many analysis requests from this IP. Please wait ${retryAfterSeconds} seconds before trying again.`
    });
  }

  record.count += 1;
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS - record.count);
  return next();
}
