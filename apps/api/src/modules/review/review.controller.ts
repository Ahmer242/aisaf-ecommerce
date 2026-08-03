/**
 * @file review.controller.ts
 * @module modules/review
 * @description Controller handling HTTP requests for product reviews and admin review moderation.
 */

import type { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { reviewService } from "./review.service.js";
import { createReviewSchema } from "@aisaf/shared";
import { z } from "zod";

const moderateReviewSchema = z.object({
  isApproved: z.boolean(),
});

export class ReviewController {
  submitReview = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const body = createReviewSchema.parse(req.body);

    const review = await reviewService.submitReview(userId, body);
    res.status(201).json({
      success: true,
      data: review,
    });
  });

  getProductReviews = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.productId as string;
    const result = await reviewService.getProductReviews(productId);

    res.json({
      success: true,
      data: result,
    });
  });

  getReviewsForModeration = asyncHandler(async (_req: Request, res: Response) => {
    const reviews = await reviewService.getReviewsForModeration();

    res.json({
      success: true,
      data: reviews,
    });
  });

  moderateReview = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { isApproved } = moderateReviewSchema.parse(req.body);

    const updated = await reviewService.moderateReview(id, isApproved);

    res.json({
      success: true,
      data: updated,
    });
  });
}

export const reviewController = new ReviewController();
