/**
 * @file admin.routes.ts
 * @module modules/admin
 * @description Express router configuration for admin dashboard endpoints.
 */

import { Router } from "express";
import { authGuard, requireRoles } from "../../middlewares/authGuard.js";
import { adminController } from "./admin.controller.js";

const router = Router();

router.use(authGuard, requireRoles("ADMIN", "STAFF"));

router.get("/overview", adminController.getOverview);
router.patch("/orders/:id/status", adminController.updateOrderStatus);

export const adminRouter = router;
