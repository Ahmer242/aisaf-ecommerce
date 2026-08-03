/**
 * @file review.service.ts
 * @module modules/review
 * @description Business logic layer for submitting product reviews, verifying purchase history,
 * calculating average ratings, and admin review moderation.
 */

import type { CreateReviewInput } from "@aisaf/shared";
import { Errors } from "../../utils/AppError.js";
import { prisma } from "../../prisma/client.js";
import { reviewRepository } from "./review.repository.js";

export class ReviewService {
  /**
   * Submit a new review for a product after checking for duplicate reviews
   * and verifying purchase history.
   * @param userId - Authenticated user ID submitting review
   * @param input - Review details (productId, rating, comment, photoUrls)
   */
  async submitReview(userId: string, input: CreateReviewInput) {
    // 1. Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    });

    if (!product) {
      throw Errors.notFound("PRODUCT_NOT_FOUND", "Product not found.");
    }

    // 2. Check for duplicate review submission by same user
    const existing = await reviewRepository.findByUserAndProduct(userId, input.productId);
    if (existing) {
      throw Errors.conflict("REVIEW_EXISTS", "You have already submitted a review for this product.");
    }

    // 3. Verify if customer actually purchased this product
    const isVerifiedPurchase = await reviewRepository.checkUserVerifiedPurchase(userId, input.productId);

    // 4. Create review record (moderation required by default)
    return reviewRepository.create({
      userId,
      productId: input.productId,
      rating: input.rating,
      comment: input.comment,
      photoUrls: input.photoUrls,
      isVerifiedPurchase,
    });
  }

  /**
   * Fetch all approved reviews for a given product and calculate summary statistics.
   * @param productId - Target Product ID
   */
  async getProductReviews(productId: string) {
    const reviews = await reviewRepository.findApprovedByProductId(productId);

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews) * 10) / 10
        : null;

    return {
      reviews,
      summary: {
        totalReviews,
        averageRating,
      },
    };
  }

  /**
   * Admin: List all pending and approved reviews for moderation.
   */
  async getReviewsForModeration() {
    return reviewRepository.findAllForModeration();
  }

  /**
   * Admin: Approve or hide a review.
   * @param reviewId - Target Review ID
   * @param isApproved - Boolean flag
   */
  async moderateReview(reviewId: string, isApproved: boolean) {
    return reviewRepository.updateApproval(reviewId, isApproved);
  }
}

/** Singleton instance of ReviewService */
export const reviewService = new ReviewService();
