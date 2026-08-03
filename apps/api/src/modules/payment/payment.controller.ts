/**
 * @file payment.controller.ts
 * @module modules/payment
 * @description Express controller for Stripe, JazzCash, and Easypaisa payment checkout sessions and callbacks.
 */

import type { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import type { AuthedRequest } from "../../middlewares/authGuard.js";
import { stripeService } from "./stripe.service.js";
import { localWalletService } from "./localWallet.service.js";

export class PaymentController {
  /**
   * POST /api/payments/stripe/create-checkout-session
   * Create Stripe Checkout session URL for an existing order.
   */
  createStripeCheckoutSession = asyncHandler(async (req: AuthedRequest, res: Response) => {
    const userId = req.auth!.sub;
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400).json({ success: false, error: { code: "MISSING_ORDER_ID", message: "orderId is required." } });
      return;
    }

    const result = await stripeService.createCheckoutSession(orderId, userId);
    res.json({ success: true, data: result });
  });

  /**
   * POST /api/payments/stripe/webhook
   * Signature-verified Stripe webhook event listener.
   */
  handleStripeWebhook = asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string | undefined;
    const rawBody = req.body; // Buffer from express.raw()

    const result = await stripeService.handleWebhook(signature, rawBody);
    res.json(result);
  });

  /**
   * POST /api/payments/jazzcash/checkout
   * Generate signed HMAC checkout payload for JazzCash.
   */
  createJazzCashPayload = asyncHandler(async (req: AuthedRequest, res: Response) => {
    const userId = req.auth!.sub;
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400).json({ success: false, error: { code: "MISSING_ORDER_ID", message: "orderId is required." } });
      return;
    }

    const payload = await localWalletService.generateJazzCashPayload(orderId, userId);
    res.json({ success: true, data: payload });
  });

  /**
   * POST /api/payments/jazzcash/callback
   * Signature-verified Instant Payment Notification callback for JazzCash.
   */
  handleJazzCashCallback = asyncHandler(async (req: Request, res: Response) => {
    const callbackData = req.body || {};
    const result = await localWalletService.verifyAndProcessJazzCashCallback(callbackData);
    res.json(result);
  });

  /**
   * POST /api/payments/easypaisa/checkout
   * Generate signed checkout payload for Easypaisa.
   */
  createEasypaisaPayload = asyncHandler(async (req: AuthedRequest, res: Response) => {
    const userId = req.auth!.sub;
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400).json({ success: false, error: { code: "MISSING_ORDER_ID", message: "orderId is required." } });
      return;
    }

    const payload = await localWalletService.generateEasypaisaPayload(orderId, userId);
    res.json({ success: true, data: payload });
  });

  /**
   * POST /api/payments/easypaisa/callback
   * Signature-verified Instant Payment Notification callback for Easypaisa.
   */
  handleEasypaisaCallback = asyncHandler(async (req: Request, res: Response) => {
    const callbackData = req.body || {};
    const result = await localWalletService.verifyAndProcessEasypaisaCallback(callbackData);
    res.json(result);
  });
}

/** Singleton instance of PaymentController */
export const paymentController = new PaymentController();
