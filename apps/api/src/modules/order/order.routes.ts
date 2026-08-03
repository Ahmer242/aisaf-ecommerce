/**
 * @file order.routes.ts
 * @module modules/order
 * @description Express router configuration for order endpoints.
 * All order operations require user authentication (authGuard).
 */

import { Router } from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { orderController } from "./order.controller.js";

const router = Router();

// Protect all order endpoints with authGuard
router.use(authGuard);

// POST /api/orders - Create a new order
router.post("/", orderController.createOrder);

// GET /api/orders/my-orders - Get list of authenticated user's orders
router.get("/my-orders", orderController.getMyOrders);

// GET /api/orders/:id - Get detailed view of an order
router.get("/:id", orderController.getOrderById);

export const orderRouter = router;
