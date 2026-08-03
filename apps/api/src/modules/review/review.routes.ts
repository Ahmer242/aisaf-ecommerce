/**
 * @file review.routes.ts
 * @module modules/review
 * @description Express router configuration for product reviews and admin moderation.
 */

import { Router } from "express";
import { authGuard, requireRoles } from "../../middlewares/authGuard.js";
import { reviewController } from "./review.controller.js";

const router = Router();

// Public route to view approved reviews for a product
router.get("/product/:productId", reviewController.getProductReviews);

// Customer route to submit review (must be logged in)
router.post("/", authGuard, reviewController.submitReview);

// Admin-only review moderation routes
router.get("/admin/moderation", authGuard, requireRoles("ADMIN", "STAFF"), reviewController.getReviewsForModeration);
router.patch("/admin/moderation/:id", authGuard, requireRoles("ADMIN", "STAFF"), reviewController.moderateReview);

export const reviewRouter = router;
