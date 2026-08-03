/**
 * @file recommendation.service.ts
 * @module modules/recommendation
 * @description Business logic layer for content-based product recommendation scoring (arc.md §6.1)
 * and market-basket co-purchase tracking (arc.md §6.2).
 */

import { Errors } from "../../utils/AppError.js";
import { prisma } from "../../prisma/client.js";
import { recommendationRepository } from "./recommendation.repository.js";

export interface RecommendationWeights {
  w1Category: number;
  w2Tags: number;
  w3Price: number;
  w4Popularity: number;
}

const DEFAULT_WEIGHTS: RecommendationWeights = {
  w1Category: 0.4,
  w2Tags: 0.3,
  w3Price: 0.15,
  w4Popularity: 0.15,
};

export class RecommendationService {
  /**
   * Calculate similarity score between productA and candidate productB per arc.md §6.1.
   */
  calculateSimilarityScore(
    productA: { categoryId: string; price: number; tagIds: string[] },
    productB: { categoryId: string; price: number; tagIds: string[]; orderCount: number },
    maxPriceRange: number = 10000,
    maxOrderCount: number = 100,
    weights: RecommendationWeights = DEFAULT_WEIGHTS,
  ): number {
    // 1. Same category match (1 if match, 0 otherwise)
    const sameCategoryScore = productA.categoryId === productB.categoryId ? 1 : 0;

    // 2. Shared tags ratio
    const tagSetA = new Set(productA.tagIds);
    const sharedTagCount = productB.tagIds.filter((t) => tagSetA.has(t)).length;
    const totalTagsUnion = new Set([...productA.tagIds, ...productB.tagIds]).size;
    const sharedTagsScore = totalTagsUnion > 0 ? sharedTagCount / totalTagsUnion : 0;

    // 3. Price proximity: 1 - (|priceA - priceB| / maxPriceRange)
    const priceDiff = Math.abs(productA.price - productB.price);
    const priceProximityScore = Math.max(0, 1 - priceDiff / Math.max(1, maxPriceRange));

    // 4. Popularity: normalized order count
    const popularityScore = Math.min(1, productB.orderCount / Math.max(1, maxOrderCount));

    // Weighted sum
    const totalScore =
      weights.w1Category * sameCategoryScore +
      weights.w2Tags * sharedTagsScore +
      weights.w3Price * priceProximityScore +
      weights.w4Popularity * popularityScore;

    return Math.round(totalScore * 1000) / 1000;
  }

  /**
   * Compute recommendation scores for a single product against all candidates and persist top matches.
   */
  async computeAndSaveRecommendations(productId: string) {
    const productA = await recommendationRepository.getProductWithDetails(productId);
    if (!productA) {
      throw Errors.notFound("PRODUCT_NOT_FOUND", "Product not found.");
    }

    const candidates = await recommendationRepository.getCandidates(productId);
    if (candidates.length === 0) return [];

    const productATagIds = productA.tags.map((t) => t.tagId);
    const productAPrice = Number(productA.price);

    const maxPriceRange = Math.max(...candidates.map((c) => Number(c.price)), productAPrice, 1);
    const maxOrderCount = Math.max(...candidates.map((c) => c.orderItems.length), 1);

    const scoredCandidates = candidates.map((cand) => {
      const score = this.calculateSimilarityScore(
        {
          categoryId: productA.categoryId,
          price: productAPrice,
          tagIds: productATagIds,
        },
        {
          categoryId: cand.categoryId,
          price: Number(cand.price),
          tagIds: cand.tags.map((t) => t.tagId),
          orderCount: cand.orderItems.length,
        },
        maxPriceRange,
        maxOrderCount,
      );

      return { candidate: cand, score };
    });

    // Sort descending by score and pick top 10
    scoredCandidates.sort((a, b) => b.score - a.score);
    const topCandidates = scoredCandidates.slice(0, 10);

    // Save relations to DB
    for (const item of topCandidates) {
      await recommendationRepository.saveProductRelation(productId, item.candidate.id, item.score);
    }

    return topCandidates;
  }

  /**
   * Get recommended "You may also like" products for a target product.
   */
  async getRecommendations(productId: string, limit: number = 6) {
    const precomputed = await recommendationRepository.getPrecomputedRelations(productId, limit);

    if (precomputed.length > 0) {
      return precomputed.map((p) => p.related);
    }

    // Fallback: calculate on-the-fly or return category bestsellers
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw Errors.notFound("PRODUCT_NOT_FOUND", "Product not found.");
    }

    return recommendationRepository.getFallbackCategoryProducts(productId, product.categoryId, limit);
  }

  /**
   * Get "Frequently Bought Together" items based on market-basket co-purchase history.
   */
  async getFrequentlyBoughtTogether(productId: string, limit: number = 4) {
    const coPurchases = await recommendationRepository.getCoPurchasePairs(productId, limit);

    if (coPurchases.length > 0) {
      return coPurchases.map((c) => c.product);
    }

    // Fallback: return related category products
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw Errors.notFound("PRODUCT_NOT_FOUND", "Product not found.");
    }

    return recommendationRepository.getFallbackCategoryProducts(productId, product.categoryId, limit);
  }

  /**
   * Record co-purchases when an order is completed/paid.
   * Increments co-purchase pair counts for all unique pairs in the order.
   */
  async recordOrderCoPurchases(productIds: string[]) {
    const uniqueIds = Array.from(new Set(productIds));
    if (uniqueIds.length < 2) return;

    for (let i = 0; i < uniqueIds.length; i++) {
      for (let j = i + 1; j < uniqueIds.length; j++) {
        const idA = uniqueIds[i];
        const idB = uniqueIds[j];
        if (idA && idB) {
          await recommendationRepository.incrementCoPurchaseCount(idA, idB);
        }
      }
    }
  }

  /**
   * Admin: Recompute recommendation matrix for all active products in catalog.
   */
  async recomputeAllRecommendations() {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    let count = 0;
    for (const p of products) {
      await this.computeAndSaveRecommendations(p.id);
      count++;
    }

    return { processedCount: count };
  }
}

export const recommendationService = new RecommendationService();
