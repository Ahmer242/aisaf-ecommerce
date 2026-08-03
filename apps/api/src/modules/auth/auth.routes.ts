import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { authGuard } from "../../middlewares/authGuard.js";
import { rateLimiter } from "../../middlewares/rateLimiter.js";
import { authController } from "./auth.controller.js";

const authRateLimit = rateLimiter({ windowMs: 15 * 60 * 1000, max: 30, keyPrefix: "auth" });

export const authRouter = Router();

authRouter.post("/register", authRateLimit, asyncHandler(authController.register));
authRouter.post("/login", authRateLimit, asyncHandler(authController.login));
authRouter.get("/me", authGuard, asyncHandler(authController.me));
