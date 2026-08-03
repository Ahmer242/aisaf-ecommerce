import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "@aisaf/shared";
import type { AuthedRequest } from "../../middlewares/authGuard.js";
import { authService } from "./auth.service.js";

export class AuthController {
  register = async (req: Request, res: Response): Promise<void> => {
    const input = registerSchema.parse(req.body);
    const data = await authService.register(input);
    res.status(201).json({ success: true, data });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const input = loginSchema.parse(req.body);
    const data = await authService.login(input);
    res.status(200).json({ success: true, data });
  };

  me = async (req: AuthedRequest, res: Response): Promise<void> => {
    const data = await authService.me(req.auth!.sub);
    res.status(200).json({ success: true, data });
  };
}

export const authController = new AuthController();
