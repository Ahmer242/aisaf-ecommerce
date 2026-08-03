/**
 * @file coupon.routes.ts
 * @module modules/coupon
 * @description Express router configuration for coupon endpoints.
 */

import { Router } from "express";
import { optionalAuth, authGuard, requireRoles } from "../../middlewares/authGuard.js";
import { couponController } from "./coupon.controller.js";

const router = Router();

// Storefront customer endpoint (optionalAuth to pass userId for first-order validation)
router.post("/validate", optionalAuth, couponController.validateCoupon);

// Admin-only management endpoints
router.get("/", authGuard, requireRoles("ADMIN", "STAFF"), couponController.getAllCoupons);
router.post("/", authGuard, requireRoles("ADMIN", "STAFF"), couponController.createCoupon);
router.patch("/:id", authGuard, requireRoles("ADMIN", "STAFF"), couponController.updateCoupon);
router.delete("/:id", authGuard, requireRoles("ADMIN", "STAFF"), couponController.deleteCoupon);

export const couponRouter = router;
