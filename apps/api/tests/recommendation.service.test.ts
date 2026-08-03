/**
 * @file recommendation.service.test.ts
 * @description Unit tests for Recommendation Engine scoring algorithm (arc.md §6.1) and fallback handling.
 */

import { describe, expect, it, vi } from "vitest";
import { RecommendationService } from "../src/modules/recommendation/recommendation.service.js";

describe("RecommendationService scoring algorithm", () => {
  const recService = new RecommendationService();

  it("scores products with matching category and tags higher than non-matching", () => {
    const productA = {
      categoryId: "cat_skincare",
      price: 2000,
      tagIds: ["tag_serum", "tag_antiaging"],
    };

    const matchingProduct = {
      categoryId: "cat_skincare",
      price: 2200,
      tagIds: ["tag_serum", "tag_hydration"],
      orderCount: 20,
    };

    const nonMatchingProduct = {
      categoryId: "cat_makeup",
      price: 500,
      tagIds: ["tag_lipstick"],
      orderCount: 5,
    };

    const scoreMatch = recService.calculateSimilarityScore(productA, matchingProduct, 5000, 100);
    const scoreNonMatch = recService.calculateSimilarityScore(productA, nonMatchingProduct, 5000, 100);

    expect(scoreMatch).toBeGreaterThan(scoreNonMatch);
    expect(scoreMatch).toBeGreaterThan(0.4); // Same category provides at least 0.4
  });

  it("yields max score for identical category, tags, price, and high popularity", () => {
    const productA = {
      categoryId: "cat_1",
      price: 1000,
      tagIds: ["tag_1"],
    };

    const candidate = {
      categoryId: "cat_1",
      price: 1000,
      tagIds: ["tag_1"],
      orderCount: 100,
    };

    const score = recService.calculateSimilarityScore(productA, candidate, 1000, 100);
    expect(score).toBe(1); // 0.4 + 0.3 + 0.15 + 0.15 = 1.0
  });
});
