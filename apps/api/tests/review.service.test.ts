/**
 * @file review.service.test.ts
 * @description Unit tests for Review Service average rating calculations and summary formatting.
 */

import { describe, expect, it, vi } from "vitest";
import { ReviewService } from "../src/modules/review/review.service.js";
import { reviewRepository } from "../src/modules/review/review.repository.js";

describe("ReviewService statistics & summary", () => {
  const reviewService = new ReviewService();

  it("calculates average rating and total count correctly", async () => {
    vi.spyOn(reviewRepository, "findApprovedByProductId").mockResolvedValueOnce([
      { id: "r1", userId: "u1", productId: "p1", rating: 5, comment: "Great", photoUrls: [], isVerifiedPurchase: true, isApproved: true, createdAt: new Date(), updatedAt: new Date() },
      { id: "r2", userId: "u2", productId: "p1", rating: 4, comment: "Good", photoUrls: [], isVerifiedPurchase: false, isApproved: true, createdAt: new Date(), updatedAt: new Date() },
      { id: "r3", userId: "u3", productId: "p1", rating: 5, comment: "Loved it", photoUrls: [], isVerifiedPurchase: true, isApproved: true, createdAt: new Date(), updatedAt: new Date() },
    ] as any);

    const result = await reviewService.getProductReviews("p1");

    expect(result.summary.totalReviews).toBe(3);
    // (5 + 4 + 5) / 3 = 14 / 3 = 4.666... -> rounded to 4.7
    expect(result.summary.averageRating).toBe(4.7);
    expect(result.reviews).toHaveLength(3);
  });

  it("handles empty review lists cleanly", async () => {
    vi.spyOn(reviewRepository, "findApprovedByProductId").mockResolvedValueOnce([]);

    const result = await reviewService.getProductReviews("p99");

    expect(result.summary.totalReviews).toBe(0);
    expect(result.summary.averageRating).toBeNull();
    expect(result.reviews).toHaveLength(0);
  });
});
