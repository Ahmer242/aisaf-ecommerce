/**
 * @file admin.controller.ts
 * @module modules/admin
 * @description Controller for administrative dashboard analytics and order management endpoints.
 */

import type { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { adminService } from "./admin.service.js";
import { z } from "zod";

const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
});

export class AdminController {
  getOverview = asyncHandler(async (_req: Request, res: Response) => {
    const data = await adminService.getOverview();

    res.json({
      success: true,
      data,
    });
  });

  updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { status } = updateOrderStatusSchema.parse(req.body);

    const updated = await adminService.updateOrderStatus(id, status as any);

    res.json({
      success: true,
      data: updated,
    });
  });
}

export const adminController = new AdminController();
