/**
 * @file admin.service.ts
 * @module modules/admin
 * @description Business logic layer for admin overview metrics, stock monitoring, and order updates.
 */

import { Errors } from "../../utils/AppError.js";
import { prisma } from "../../prisma/client.js";
import { adminRepository } from "./admin.repository.js";
import type { OrderStatus } from "@aisaf/shared";

export class AdminService {
  /**
   * Fetch aggregate store dashboard overview.
   */
  async getOverview() {
    const [metrics, lowStockAlerts, recentOrders] = await Promise.all([
      adminRepository.getDashboardMetrics(),
      adminRepository.getLowStockAlerts(5),
      adminRepository.getRecentOrders(10),
    ]);

    return {
      metrics,
      lowStockAlerts,
      recentOrders,
    };
  }

  /**
   * Admin: Update status of a customer order.
   */
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existing) {
      throw Errors.notFound("ORDER_NOT_FOUND", "Order not found.");
    }

    return adminRepository.updateOrderStatus(orderId, status as any);
  }
}

export const adminService = new AdminService();
