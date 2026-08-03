/**
 * @file recommendation.repository.ts
 * @module modules/recommendation
 * @description Data access layer for precomputed product relations and co-purchase statistics.
 */

import { prisma } from "../../prisma/client.js";

export class RecommendationRepository {
  /**
   * Fetch precomputed product relations for a given product
   */
  async getPrecomputedRelations(productId: string, limit: number = 10) {
    return prisma.productRelation.findMany({
      where: { productId },
      include: {
        related: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
            tags: { include: { tag: true } },
          },
        },
      },
      orderBy: { score: "desc" },
      take: limit,
    });
  }

  /**
   * Upsert precomputed recommendation relation score
   */
  async saveProductRelation(productId: string, relatedId: string, score: number) {
    return prisma.productRelation.upsert({
      where: {
        productId_relatedId: { productId, relatedId },
      },
      create: {
        productId,
        relatedId,
        score,
      },
      update: {
        score,
        computedAt: new Date(),
      },
    });
  }

  /**
   * Fetch market-basket co-purchased products
   */
  async getCoPurchasePairs(productId: string, limit: number = 4) {
    const pairs = await prisma.coPurchasePair.findMany({
      where: {
        OR: [{ productAId: productId }, { productBId: productId }],
      },
      include: {
        productA: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
        productB: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { count: "desc" },
      take: limit,
    });

    // Map pairs to return the associated co-purchased product
    return pairs.map((pair) => {
      const coProduct = pair.productAId === productId ? pair.productB : pair.productA;
      return {
        product: coProduct,
        coPurchaseCount: pair.count,
      };
    });
  }

  /**
   * Increment co-purchase count for two products bought together in an order
   */
  async incrementCoPurchaseCount(productAId: string, productBId: string) {
    // Ensure consistent ordering to avoid duplicate pairs (A-B vs B-A)
    const [firstId, secondId] = [productAId, productBId].sort();
    if (!firstId || !secondId) return;

    return prisma.coPurchasePair.upsert({
      where: {
        productAId_productBId: { productAId: firstId, productBId: secondId },
      },
      create: {
        productAId: firstId,
        productBId: secondId,
        count: 1,
      },
      update: {
        count: { increment: 1 },
      },
    });
  }

  /**
   * Fetch product candidate pool for computing recommendation scores
   */
  async getProductWithDetails(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        tags: true,
        orderItems: { select: { id: true } },
      },
    });
  }

  /**
   * Fetch candidate products for comparison
   */
  async getCandidates(excludeProductId: string) {
    return prisma.product.findMany({
      where: {
        id: { not: excludeProductId },
        isActive: true,
      },
      include: {
        tags: true,
        category: { select: { id: true, name: true, slug: true } },
        orderItems: { select: { id: true } },
      },
    });
  }

  /**
   * Fallback: get top active products in same category
   */
  async getFallbackCategoryProducts(productId: string, categoryId: string, limit: number) {
    return prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId },
        isActive: true,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}

export const recommendationRepository = new RecommendationRepository();
