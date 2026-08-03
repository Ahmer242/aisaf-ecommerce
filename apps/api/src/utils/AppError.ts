export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly isOperational: boolean;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

export const Errors = {
  badRequest: (code: string, message: string) => new AppError(400, code, message),
  unauthorized: (message = "Authentication required.") =>
    new AppError(401, "UNAUTHORIZED", message),
  forbidden: (message = "You do not have permission to perform this action.") =>
    new AppError(403, "FORBIDDEN", message),
  notFound: (code: string, message: string) => new AppError(404, code, message),
  conflict: (code: string, message: string) => new AppError(409, code, message),
  tooMany: (message = "Too many requests. Please try again later.") =>
    new AppError(429, "RATE_LIMITED", message),
  internal: (message = "Something went wrong.") =>
    new AppError(500, "INTERNAL_ERROR", message),
} as const;
