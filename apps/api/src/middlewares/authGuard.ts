import type { NextFunction, Request, Response } from "express";
import type { Role } from "@aisaf/shared";
import { Errors } from "../utils/AppError.js";
import { verifyAuthToken, type AuthTokenPayload } from "../utils/token.js";

export type AuthedRequest = Request & { auth?: AuthTokenPayload };

export function authGuard(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(Errors.unauthorized());
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    req.auth = verifyAuthToken(token);
    next();
  } catch {
    next(Errors.unauthorized("Invalid or expired token."));
  }
}

export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();
    try {
      req.auth = verifyAuthToken(token);
    } catch {
      // Ignore token verification failure for optional auth
    }
  }
  next();
}

export function requireRoles(...roles: Role[]) {
  return (req: AuthedRequest, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(Errors.unauthorized());
      return;
    }
    if (!roles.includes(req.auth.role)) {
      next(Errors.forbidden());
      return;
    }
    next();
  };
}

