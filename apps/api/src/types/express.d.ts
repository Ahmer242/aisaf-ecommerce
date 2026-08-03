import type { Role } from "@aisaf/shared";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        name?: string | null;
      };
    }
  }
}
