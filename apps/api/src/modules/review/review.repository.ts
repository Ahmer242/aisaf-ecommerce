/**
 * @file review.repository.ts
 * @module modules/review
 * @description Data access layer for Product Reviews and Ratings.
 */

import { prisma } from "../../prisma/client.js";

/** Input structure for submitting a product review */
export interface CreateReviewData {
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  photoUrls?: string[];
  isVerifiedPurchase: boolean;
}

export class ReviewRepository {
  /**
   * Check if a user has purchased a specific product in a completed or delivered order.
   * @param userId - Target User ID
   * @param productId - Target Product ID
   */
  async checkUserVerifiedPurchase(userId: string, productId: string): Promise<boolean> {
    const matchingOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: { in: ["DELIVERED", "CONFIRMED", "SHIPPED"] },
        items: {
          some: { productId },
        },
      },
    });

    return !!matchingOrder;
  }

  /**
   * Find an existing review submitted by a specific user for a product.
   * @param userId - User ID
   * @param productId - Product ID
   */
  async findByUserAndProduct(userId: string, productId: string) {
    return prisma.review.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });
  }

  /**
   * Create a new product review entry.
   * @param data - Review payload
   */
  async create(data: CreateReviewData) {
    return prisma.review.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        rating: data.rating,
        comment: data.comment || null,
        photoUrls: data.photoUrls || [],
        isVerifiedPurchase: data.isVerifiedPurchase,
        isApproved: false, // Requires admin moderation by default
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }

  /**
   * Fetch approved reviews for a given product ordered by creation date.
   * @param productId - Target Product ID
   */
  async findApprovedByProductId(productId: string) {
    return prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Admin: Fetch all pending or moderated reviews.
   */
  async findAllForModeration() {
    return prisma.review.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        product: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Admin: Toggle review approval state.
   * @param reviewId - Target Review ID
   * @param isApproved - Approval status
   */
  async updateApproval(reviewId: string, isApproved: boolean) {
    return prisma.review.update({
      where: { id: reviewId },
      data: { isApproved },
    });
  }
}

/** Singleton instance of ReviewRepository */
export const reviewRepository = new ReviewRepository();
