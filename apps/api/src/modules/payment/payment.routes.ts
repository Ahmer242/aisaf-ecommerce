/**
 * @file payment.routes.ts
 * @module modules/payment
 * @description Express router configuration for Stripe, JazzCash, and Easypaisa payment endpoints.
 */

import express, { Router } from "express";
import { authGuard } from "../../middlewares/authGuard.js";
import { paymentController } from "./payment.controller.js";

const router = Router();

// Stripe Routes
router.post("/stripe/create-checkout-session", authGuard, paymentController.createStripeCheckoutSession);
router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhook,
);

// JazzCash Routes
router.post("/jazzcash/checkout", authGuard, paymentController.createJazzCashPayload);
router.post("/jazzcash/callback", paymentController.handleJazzCashCallback);

// Easypaisa Routes
router.post("/easypaisa/checkout", authGuard, paymentController.createEasypaisaPayload);
router.post("/easypaisa/callback", paymentController.handleEasypaisaCallback);

export const paymentRouter = router;
