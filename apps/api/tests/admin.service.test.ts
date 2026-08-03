/**
 * @file admin.service.test.ts
 * @description Unit tests for Admin Service overview metrics and order status updates.
 */

import { describe, expect, it, vi } from "vitest";
import { AdminService } from "../src/modules/admin/admin.service.js";
import { adminRepository } from "../src/modules/admin/admin.repository.js";
import { prisma } from "../src/prisma/client.js";

describe("AdminService operations", () => {
  const adminService = new AdminService();

  it("fetches overview stats cleanly", async () => {
    vi.spyOn(adminRepository, "getDashboardMetrics").mockResolvedValueOnce({
      totalOrders: 50,
      totalRevenue: 150000,
      totalCustomers: 30,
      lowStockVariantsCount: 2,
    });

    vi.spyOn(adminRepository, "getLowStockAlerts").mockResolvedValueOnce([
      { id: "var_1", stock: 2, product: { name: "Serum", slug: "serum", brand: "GlowMart" } } as any,
    ]);

    vi.spyOn(adminRepository, "getRecentOrders").mockResolvedValueOnce([]);

    const result = await adminService.getOverview();

    expect(result.metrics.totalOrders).toBe(50);
    expect(result.metrics.totalRevenue).toBe(150000);
    expect(result.lowStockAlerts).toHaveLength(1);
  });

  it("throws notFound error when updating non-existent order status", async () => {
    vi.spyOn(prisma.order, "findUnique").mockResolvedValueOnce(null);

    await expect(adminService.updateOrderStatus("invalid_ord", "SHIPPED")).rejects.toThrow("Order not found");
  });
});
