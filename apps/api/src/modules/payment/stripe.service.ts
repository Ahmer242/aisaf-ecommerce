/**
 * @file stripe.service.ts
 * @module modules/payment
 * @description Integration service for Stripe Payment gateway.
 * Handles checkout session creation and signature-verified webhook processing per rules.md §4.2.
 */

import Stripe from "stripe";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { prisma } from "../../prisma/client.js";
import { Errors } from "../../utils/AppError.js";

/** Initialize Stripe SDK if secret key is present */
const stripeClient = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2025-01-27.acacia" as any })
  : null;

export class StripeService {
  /**
   * Create a Stripe Checkout Session for an existing unpaid order.
   * @param orderId - Target order ID
   * @param userId - Requesting user ID for ownership validation
   * @returns Checkout Session URL for redirecting customer
   */
  async createCheckoutSession(orderId: string, userId: string): Promise<{ checkoutUrl: string; sessionId?: string }> {
    // 1. Fetch order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw Errors.notFound("ORDER_NOT_FOUND", "Order not found.");
    }

    if (order.userId !== userId) {
      throw Errors.forbidden("You do not have permission to access this order.");
    }

    if (order.paymentStatus === PaymentStatus.SUCCEEDED) {
      throw Errors.badRequest("ALREADY_PAID", "This order has already been paid.");
    }

    // Fallback mode if Stripe API Key is not configured in local environment
    if (!stripeClient) {
      logger.warn({ orderId }, "STRIPE_SECRET_KEY not configured. Simulated checkout fallback mode active.");

      // Record simulated payment
      const payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: PaymentMethod.STRIPE,
          providerRef: `simulated_checkout_${Date.now()}`,
          amount: order.totalAmount,
          currency: order.currency,
          status: PaymentStatus.SUCCEEDED,
        },
      });

      // Update Order payment status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.SUCCEEDED,
          status: OrderStatus.CONFIRMED,
        },
      });

      return {
        checkoutUrl: `${env.CORS_ORIGIN}/checkout/success?orderId=${order.id}&paymentId=${payment.id}`,
        sessionId: payment.providerRef!,
      };
    }

    // 2. Build Stripe Checkout Session line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((item) => ({
      price_data: {
        currency: order.currency.toLowerCase(),
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(Number(item.unitPrice) * 100), // Stripe expects amounts in smallest unit (e.g. cents / paisas)
      },
      quantity: item.qty,
    }));

    // Add shipping fee line item if applicable
    if (Number(order.shippingAmount) > 0) {
      lineItems.push({
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: {
            name: "Standard Shipping",
          },
          unit_amount: Math.round(Number(order.shippingAmount) * 100),
        },
        quantity: 1,
      });
    }

    // Subtract discount if applied
    const discountAmount = Number(order.discountAmount);

    // 3. Create Stripe Checkout Session
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
        userId: order.userId,
        discountAmount: discountAmount.toString(),
      },
      success_url: `${env.CORS_ORIGIN}/checkout/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CORS_ORIGIN}/checkout/cancel?orderId=${order.id}`,
    });

    // 4. Record pending payment entry in database
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: PaymentMethod.STRIPE,
        providerRef: session.id,
        amount: order.totalAmount,
        currency: order.currency,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      checkoutUrl: session.url!,
      sessionId: session.id,
    };
  }

  /**
   * Signature-verified webhook handler for Stripe events per rules.md §4.2.
   * @param signature - Header value from 'stripe-signature'
   * @param rawBody - Unparsed Buffer of raw request body
   */
  async handleWebhook(signature: string | undefined, rawBody: Buffer): Promise<{ received: boolean }> {
    if (!stripeClient || !env.STRIPE_WEBHOOK_SECRET) {
      logger.warn("Stripe webhook received but client or STRIPE_WEBHOOK_SECRET is not configured.");
      return { received: true };
    }

    if (!signature) {
      throw Errors.badRequest("MISSING_SIGNATURE", "Stripe signature header missing.");
    }

    let event: Stripe.Event;
    try {
      event = stripeClient.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      logger.error({ error: err.message }, "Stripe webhook signature verification failed.");
      throw Errors.badRequest("INVALID_SIGNATURE", `Webhook Signature Verification Failed: ${err.message}`);
    }

    logger.info({ eventType: event.type }, "Processing Stripe webhook event.");

    // Handle session completion event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.client_reference_id || session.metadata?.orderId;

      if (orderId) {
        await prisma.$transaction(async (tx) => {
          // Update Order payment status to SUCCEEDED and order status to CONFIRMED
          await tx.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: PaymentStatus.SUCCEEDED,
              status: OrderStatus.CONFIRMED,
            },
          });

          // Update Payment status record
          await tx.payment.updateMany({
            where: { orderId, provider: PaymentMethod.STRIPE },
            data: {
              status: PaymentStatus.SUCCEEDED,
              providerRef: session.id,
              rawPayload: session as any,
            },
          });
        });

        logger.info({ orderId }, "Successfully processed Stripe payment for order.");
      }
    }

    return { received: true };
  }
}

/** Singleton instance of StripeService */
export const stripeService = new StripeService();
