import type { Request, Response } from "express";
import { productListQuerySchema } from "@aisaf/shared";
import { productService } from "./product.service.js";

export class ProductController {
  list = async (req: Request, res: Response): Promise<void> => {
    const query = productListQuerySchema.parse(req.query);
    const data = await productService.list(query);
    res.status(200).json({ success: true, data });
  };

  getBySlug = async (req: Request, res: Response): Promise<void> => {
    const slug = String(req.params.slug ?? "");
    const data = await productService.getBySlug(slug);
    res.status(200).json({ success: true, data });
  };

  listCategories = async (_req: Request, res: Response): Promise<void> => {
    const data = await productService.listCategories();
    res.status(200).json({ success: true, data });
  };
}

export const productController = new ProductController();
