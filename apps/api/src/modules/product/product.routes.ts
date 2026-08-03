import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { productController } from "./product.controller.js";

export const productRouter = Router();

productRouter.get("/", asyncHandler(productController.list));
productRouter.get("/categories", asyncHandler(productController.listCategories));
productRouter.get("/:slug", asyncHandler(productController.getBySlug));
