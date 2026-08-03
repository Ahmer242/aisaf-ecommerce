/**
 * @file coupon.controller.ts
 * @module modules/coupon
 * @description Express controller for coupon validation and coupon management endpoints.
 */

import type { Request, Response } from "express";
import { applyCouponSchema } from "@aisaf/shared";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import type { AuthedRequest } from "../../middlewares/authGuard.js";
import { couponService } from "./coupon.service.js";

export class CouponController {
  /**
   * POST /api/coupons/validate
   * Customer endpoint: validate a promo code against cart subtotal.
   */
  validateCoupon = asyncHandler(async (req: Request, res: Response) => {
    const input = applyCouponSchema.parse(req.body);
    const userId = (req as any).auth?.sub;

    const result = await couponService.validateCoupon(input.code, input.subtotal, userId);
    res.json({ success: true, data: result });
  });

  /**
   * GET /api/coupons
   * Admin endpoint: list all promotional coupons.
   */
  getAllCoupons = asyncHandler(async (_req: Request, res: Response) => {
    const coupons = await couponService.getAllCoupons();
    res.json({ success: true, data: coupons });
  });

  /**
   * POST /api/coupons
   * Admin endpoint: create a new promotional coupon.
   */
  createCoupon = asyncHandler(async (req: AuthedRequest, res: Response) => {
    const coupon = await couponService.createCoupon(req.body);
    res.status(201).json({ success: true, data: coupon });
  });

  /**
   * PATCH /api/coupons/:id
   * Admin endpoint: update an existing coupon.
   */
  updateCoupon = asyncHandler(async (req: AuthedRequest, res: Response) => {
    const id = req.params.id as string;
    const coupon = await couponService.updateCoupon(id, req.body);
    res.json({ success: true, data: coupon });
  });

  /**
   * DELETE /api/coupons/:id
   * Admin endpoint: delete a coupon.
   */
  deleteCoupon = asyncHandler(async (req: AuthedRequest, res: Response) => {
    const id = req.params.id as string;
    await couponService.deleteCoupon(id);
    res.json({ success: true, data: { message: "Coupon deleted successfully." } });
  });
}

/** Singleton instance of CouponController */
export const couponController = new CouponController();
