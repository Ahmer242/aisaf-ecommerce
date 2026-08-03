import { describe, expect, it } from "vitest";
import { averageRating, toListItem } from "../src/modules/product/product.mapper.js";
import type { ProductWithRelations } from "../src/modules/product/product.repository.js";

function makeProduct(
  overrides: Partial<ProductWithRelations> = {},
): ProductWithRelations {
  return {
    id: "p1",
    name: "Serum",
    slug: "serum",
    description: "desc",
    ingredients: null,
    price: { toNumber: () => 1000 } as ProductWithRelations["price"],
    compareAtPrice: null,
    brand: "AISAF",
    categoryId: "c1",
    images: ["https://example.com/a.jpg"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    searchVector: null,
    category: { id: "c1", name: "Skincare", slug: "skincare", parentId: null },
    tags: [],
    variants: [
      {
        id: "v1",
        productId: "p1",
        attribute: "SIZE",
        value: "30ml",
        sku: "SKU-1",
        stock: 2,
        priceOverride: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    reviews: [{ rating: 5 }, { rating: 4 }],
    ...overrides,
  };
}

describe("product.mapper", () => {
  it("returns null average when there are no reviews", () => {
    expect(averageRating([])).toBeNull();
  });

  it("computes rounded average rating", () => {
    expect(averageRating([{ rating: 5 }, { rating: 4 }, { rating: 5 }])).toBe(4.7);
  });

  it("maps list item with stock and rating", () => {
    const item = toListItem(makeProduct());
    expect(item.price).toBe(1000);
    expect(item.averageRating).toBe(4.5);
    expect(item.inStock).toBe(true);
    expect(item.category?.slug).toBe("skincare");
  });

  it("marks out of stock when all variants are zero", () => {
    const item = toListItem(
      makeProduct({
        variants: [
          {
            id: "v1",
            productId: "p1",
            attribute: "SIZE",
            value: "30ml",
            sku: "SKU-1",
            stock: 0,
            priceOverride: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        reviews: [],
      }),
    );
    expect(item.inStock).toBe(false);
    expect(item.averageRating).toBeNull();
  });
});
