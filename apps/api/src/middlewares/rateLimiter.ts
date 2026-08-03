import type { NextFunction, Request, Response } from "express";
import { Errors } from "../utils/AppError.js";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Simple in-memory rate limiter (no Redis required for Phase 1).
 * Swap for Redis-backed counters when Redis is wired (arc.md §3).
 */
export function rateLimiter(options: {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}) {
  const { windowMs, max, keyPrefix = "rl" } = options;

  return (req: Request, _res: Response, next: NextFunction): void => {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    existing.count += 1;
    if (existing.count > max) {
      next(Errors.tooMany());
      return;
    }
    next();
  };
}
