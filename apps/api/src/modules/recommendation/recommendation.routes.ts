/**
 * @file recommendation.routes.ts
 * @module modules/recommendation
 * @description Express router for product recommendations and co-purchases.
 */

import { Router } from "express";
import { authGuard, requireRoles } from "../../middlewares/authGuard.js";
import { recommendationController } from "./recommendation.controller.js";

const router = Router();

// Public recommendation endpoints
router.get("/product/:productId/recommendations", recommendationController.getRecommendations);
router.get("/product/:productId/frequently-bought-together", recommendationController.getFrequentlyBoughtTogether);

// Admin-only trigger to batch recompute relation scores
router.post("/admin/recompute", authGuard, requireRoles("ADMIN", "STAFF"), recommendationController.recomputeAll);

export const recommendationRouter = router;
