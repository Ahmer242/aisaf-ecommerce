import type { Prisma } from "@prisma/client";
import { prisma } from "../../prisma/client.js";
import type { ProductListQuery } from "@aisaf/shared";

const productInclude = {
  category: true,
  tags: { include: { tag: true } },
  variants: true,
  reviews: {
    where: { isApproved: true },
    select: { rating: true },
  },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export class ProductRepository {
  async list(query: ProductListQuery): Promise<{ items: ProductWithRelations[]; total: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (query.brand) {
      where.brand = { equals: query.brand, mode: "insensitive" };
    }

    if (query.category) {
      where.OR = [
        { categoryId: query.category },
        { category: { slug: query.category } },
      ];
    }

    if (query.tag) {
      where.tags = { some: { tag: { slug: query.tag } } };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }

    if (query.inStock) {
      where.variants = { some: { stock: { gt: 0 } } };
    }

    if (query.q) {
      // FTS via raw query path lives here when tsvector is populated (arc.md §6.5).
      // Phase 1 fallback: case-insensitive contains on name/description/brand.
      where.AND = [
        {
          OR: [
            { name: { contains: query.q, mode: "insensitive" } },
            { description: { contains: query.q, mode: "insensitive" } },
            { brand: { contains: query.q, mode: "insensitive" } },
          ],
        },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    switch (query.sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Rating sort is applied in service after aggregation for Phase 1 simplicity.
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: query.sort === "rating" ? { createdAt: "desc" } : orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  findBySlug(slug: string): Promise<ProductWithRelations | null> {
    return prisma.product.findFirst({
      where: { slug, isActive: true },
      include: productInclude,
    });
  }

  findById(id: string): Promise<ProductWithRelations | null> {
    return prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
  }

  listCategories() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  }
}

export const productRepository = new ProductRepository();
