/**
 * @file order.controller.ts
 * @module modules/order
 * @description Express controller handlers for order management endpoints.
 * Parses input using Zod schemas and delegates request processing to OrderService.
 */

import type { Response } from "express";
import { createOrderSchema } from "@aisaf/shared";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import type { AuthedRequest } from "../../middlewares/authGuard.js";
import { orderService } from "./order.service.js";

export class OrderController {
  /**
   * POST /api/orders
   * Create a new order from current cart items with stock locking.
   */
  createOrder = asyncHandler(async (req: AuthedRequest, res: Response) => {
    const userId = req.auth!.sub;
    const input = createOrderSchema.parse(req.body);

    const order = await orderService.createOrder(userId, input);
    res.status(201).json({ success: true, data: order });
  });

  /**
   * GET /api/orders/my-orders
   * Retrieve all orders for the currently authenticated user.
   */
  getMyOrders = asyncHandler(async (req: AuthedRequest, res: Response) => {
    const userId = req.auth!.sub;
    const orders = await orderService.getUserOrders(userId);
    res.json({ success: true, data: orders });
  });

  /**
   * GET /api/orders/:id
   * Retrieve order details by ID.
   */
  getOrderById = asyncHandler(async (req: AuthedRequest, res: Response) => {
    const userId = req.auth!.sub;
    const isAdmin = req.auth!.role === "ADMIN" || req.auth!.role === "STAFF";
    const id = req.params.id as string;

    const order = await orderService.getOrderById(id, userId, isAdmin);
    res.json({ success: true, data: order });
  });
}

/** Singleton instance of OrderController */
export const orderController = new OrderController();
