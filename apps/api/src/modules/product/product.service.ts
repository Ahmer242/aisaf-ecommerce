import type {
  PaginatedProducts,
  ProductDetail,
  ProductListQuery,
} from "@aisaf/shared";
import { Errors } from "../../utils/AppError.js";
import { toDetail, toListItem } from "./product.mapper.js";
import { productRepository } from "./product.repository.js";

export class ProductService {
  async list(query: ProductListQuery): Promise<PaginatedProducts> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const { items, total } = await productRepository.list(query);

    let mapped = items.map(toListItem);

    if (query.minRating !== undefined) {
      mapped = mapped.filter(
        (p) => (p.averageRating ?? 0) >= (query.minRating as number),
      );
    }

    if (query.sort === "rating") {
      mapped = [...mapped].sort(
        (a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0),
      );
    }

    return {
      items: mapped,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async getBySlug(slug: string): Promise<ProductDetail> {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      throw Errors.notFound("PRODUCT_NOT_FOUND", "Product not found.");
    }
    return toDetail(product);
  }

  async listCategories() {
    return productRepository.listCategories();
  }
}

export const productService = new ProductService();
