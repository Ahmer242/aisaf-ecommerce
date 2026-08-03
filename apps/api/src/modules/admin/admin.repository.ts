/**
 * @file admin.repository.ts
 * @module modules/admin
 * @description Data access layer for admin metrics, order management, and store analytics.
 */

import { prisma } from "../../prisma/client.js";

export class AdminRepository {
  /**
   * Fetch aggregate revenue, order counts, customer totals, and low-stock count
   */
  async getDashboardMetrics() {
    const [totalOrders, totalRevenueData, totalCustomers, lowStockVariantsCount] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] } },
      }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.productVariant.count({ where: { stock: { lte: 5 } } }),
    ]);

    const totalRevenue = Number(totalRevenueData._sum.totalAmount || 0);

    return {
      totalOrders,
      totalRevenue,
      totalCustomers,
      lowStockVariantsCount,
    };
  }

  /**
   * Fetch variants with low stock (<= 5)
   */
  async getLowStockAlerts(threshold: number = 5) {
    return prisma.productVariant.findMany({
      where: {
        stock: { lte: threshold },
      },
      include: {
        product: {
          select: { id: true, name: true, slug: true, brand: true },
        },
      },
      orderBy: { stock: "asc" },
      take: 20,
    });
  }

  /**
   * Fetch recent orders for admin dashboard table
   */
  async getRecentOrders(limit: number = 10) {
    return prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { select: { id: true, name: true, qty: true, unitPrice: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Update order status and trigger status audit
   */
  async updateOrderStatus(orderId: string, status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED") {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}

export const adminRepository = new AdminRepository();
