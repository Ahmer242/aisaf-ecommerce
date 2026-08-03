/**
 * @file recommendation.controller.ts
 * @module modules/recommendation
 * @description Controller handling HTTP endpoints for product recommendations and admin recomputation.
 */

import type { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { recommendationService } from "./recommendation.service.js";

export class RecommendationController {
  getRecommendations = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.productId as string;
    const limit = req.query.limit ? Number(req.query.limit) : 6;

    const items = await recommendationService.getRecommendations(productId, limit);

    res.json({
      success: true,
      data: items,
    });
  });

  getFrequentlyBoughtTogether = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.productId as string;
    const limit = req.query.limit ? Number(req.query.limit) : 4;

    const items = await recommendationService.getFrequentlyBoughtTogether(productId, limit);

    res.json({
      success: true,
      data: items,
    });
  });

  recomputeAll = asyncHandler(async (_req: Request, res: Response) => {
    const result = await recommendationService.recomputeAllRecommendations();

    res.json({
      success: true,
      data: result,
    });
  });
}

export const recommendationController = new RecommendationController();
