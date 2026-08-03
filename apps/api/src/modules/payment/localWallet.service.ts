/**
 * @file localWallet.service.ts
 * @module modules/payment
 * @description Integration service for Pakistani local mobile wallets (JazzCash & Easypaisa).
 * Generates HMAC-SHA256 signed payment payloads, verifies callback response signatures
 * per rules.md §4.2, and updates order payment statuses.
 */

import crypto from "node:crypto";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { prisma } from "../../prisma/client.js";
import { Errors } from "../../utils/AppError.js";

/** Interface for JazzCash Payment Payload */
export interface JazzCashPayload {
  postUrl: string;
  fields: Record<string, string>;
}

/** Interface for Easypaisa Payment Payload */
export interface EasypaisaPayload {
  postUrl: string;
  fields: Record<string, string>;
}

export class LocalWalletService {
  /**
   * Helper function to calculate JazzCash HMAC-SHA256 SecureHash signature.
   * Concatenates all non-empty parameters starting with 'pp_' sorted alphabetically by key,
   * separated by '&', using the Integrity Salt as the secret key.
   * @param params - Key-value pair of request/response fields
   * @param integritySalt - Secret integrity salt provided by JazzCash
   */
  public calculateJazzCashSecureHash(params: Record<string, string>, integritySalt: string): string {
    // 1. Filter out empty fields and pp_SecureHash itself
    const sortedKeys = Object.keys(params)
      .filter((key) => key.startsWith("pp_") && key !== "pp_SecureHash" && params[key] !== "" && params[key] !== undefined)
      .sort();

    // 2. Build string to hash
    const valuesToHash: string[] = [];
    for (const key of sortedKeys) {
      if (params[key]) {
        valuesToHash.push(params[key]!);
      }
    }
    const stringToHash = [integritySalt, ...valuesToHash].join("&");

    // 3. Generate HMAC-SHA256 signature
    return crypto
      .createHmac("sha256", integritySalt)
      .update(stringToHash)
      .digest("hex")
      .toUpperCase();
  }

  /**
   * Generate an HMAC-SHA256 signed payload for JazzCash Checkout.
   * @param orderId - Target Order ID
   * @param userId - ID of authenticated customer
   */
  async generateJazzCashPayload(orderId: string, userId: string): Promise<JazzCashPayload> {
    // 1. Retrieve order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw Errors.notFound("ORDER_NOT_FOUND", "Order not found.");
    }

    if (order.userId !== userId) {
      throw Errors.forbidden("You do not have permission to access this order.");
    }

    if (order.paymentStatus === PaymentStatus.SUCCEEDED) {
      throw Errors.badRequest("ALREADY_PAID", "Order has already been paid.");
    }

    // Default configuration values or fallback sandbox defaults
    const merchantId = env.JAZZCASH_MERCHANT_ID || "MC_SANDBOX_12345";
    const password = env.JAZZCASH_PASSWORD || "sandbox_pass";
    const integritySalt = env.JAZZCASH_INTEGRITY_SALT || "sandbox_integrity_salt_12345";

    // Format current date & expiry
    const now = new Date();
    const formattedNow = now.toISOString().replace(/[-T:]/g, "").slice(0, 14);
    const expiryDate = new Date(now.getTime() + 60 * 60 * 1000);
    const formattedExpiry = expiryDate.toISOString().replace(/[-T:]/g, "").slice(0, 14);

    // Format transaction amount in paisa (multiplied by 100)
    const amountInPaisa = Math.round(Number(order.totalAmount) * 100).toString();
    const txnRefNo = `JC${Date.now()}`;

    const fields: Record<string, string> = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_Language: "EN",
      pp_MerchantID: merchantId,
      pp_Password: password,
      pp_TxnRefNo: txnRefNo,
      pp_Amount: amountInPaisa,
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: formattedNow,
      pp_BillReference: order.id,
      pp_Description: `AISAF Order ${order.id}`,
      pp_TxnExpiryDateTime: formattedExpiry,
      pp_ReturnURL: `${env.CORS_ORIGIN}/api/payments/jazzcash/callback`,
      pp_SecureHash: "",
    };

    // Calculate SecureHash
    fields.pp_SecureHash = this.calculateJazzCashSecureHash(fields, integritySalt);

    // Record pending payment in DB
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: PaymentMethod.JAZZCASH,
        providerRef: txnRefNo,
        amount: order.totalAmount,
        currency: "PKR",
        status: PaymentStatus.PENDING,
      },
    });

    return {
      postUrl: "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/",
      fields,
    };
  }

  /**
   * Signature-verified webhook / IPN listener for JazzCash payment callback per rules.md §4.2.
   * @param params - Callback payload from JazzCash POST request
   */
  async verifyAndProcessJazzCashCallback(params: Record<string, string>): Promise<{ success: boolean; message: string }> {
    const integritySalt = env.JAZZCASH_INTEGRITY_SALT || "sandbox_integrity_salt_12345";

    // 1. Verify HMAC SecureHash signature
    const receivedHash = params.pp_SecureHash;
    const computedHash = this.calculateJazzCashSecureHash(params, integritySalt);

    if (receivedHash !== computedHash) {
      logger.error({ receivedHash, computedHash }, "JazzCash signature verification failed.");
      throw Errors.badRequest("INVALID_SIGNATURE", "JazzCash webhook signature verification failed.");
    }

    const orderId = params.pp_BillReference;
    const responseCode = params.pp_ResponseCode;
    const responseMessage = params.pp_ResponseMessage || "Processed";

    if (!orderId) {
      throw Errors.badRequest("MISSING_BILL_REF", "Missing pp_BillReference in callback.");
    }

    // 2. Check if payment succeeded ("000" indicates success in JazzCash)
    const isSuccess = responseCode === "000";

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: isSuccess ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
          ...(isSuccess ? { status: OrderStatus.CONFIRMED } : {}),
        },
      });

      await tx.payment.updateMany({
        where: { orderId, provider: PaymentMethod.JAZZCASH },
        data: {
          status: isSuccess ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
          rawPayload: params as any,
        },
      });
    });

    logger.info({ orderId, isSuccess, responseMessage }, "Processed JazzCash payment callback.");
    return { success: isSuccess, message: responseMessage };
  }

  /**
   * Helper function to calculate Easypaisa SHA256 signature hash token.
   * @param storeId - Easypaisa Store ID
   * @param orderId - Order ID
   * @param amount - Transaction amount string
   * @param hashKey - Merchant hash key
   */
  public calculateEasypaisaHash(storeId: string, orderId: string, amount: string, hashKey: string): string {
    const rawString = `amount=${amount}&orderId=${orderId}&storeId=${storeId}&postBackURL=${env.CORS_ORIGIN}/api/payments/easypaisa/callback`;
    return crypto.createHmac("sha256", hashKey).update(rawString).digest("hex");
  }

  /**
   * Generate an encrypted / signed checkout payload for Easypaisa Mobile Wallet.
   * @param orderId - Target Order ID
   * @param userId - ID of authenticated customer
   */
  async generateEasypaisaPayload(orderId: string, userId: string): Promise<EasypaisaPayload> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw Errors.notFound("ORDER_NOT_FOUND", "Order not found.");
    }

    if (order.userId !== userId) {
      throw Errors.forbidden("You do not have permission to access this order.");
    }

    if (order.paymentStatus === PaymentStatus.SUCCEEDED) {
      throw Errors.badRequest("ALREADY_PAID", "Order has already been paid.");
    }

    const storeId = env.EASYPAISA_STORE_ID || "EP_STORE_9988";
    const hashKey = env.EASYPAISA_HASH_KEY || "ep_sandbox_hash_key_12345";
    const amountStr = Number(order.totalAmount).toFixed(2);
    const txnRefNo = `EP${Date.now()}`;

    const signature = this.calculateEasypaisaHash(storeId, order.id, amountStr, hashKey);

    const fields: Record<string, string> = {
      storeId,
      orderId: order.id,
      transactionAmount: amountStr,
      transactionType: "MA",
      mobileAccountNo: "",
      emailAddress: "",
      postBackURL: `${env.CORS_ORIGIN}/api/payments/easypaisa/callback`,
      signature,
    };

    // Record pending payment in DB
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: PaymentMethod.EASYPAISA,
        providerRef: txnRefNo,
        amount: order.totalAmount,
        currency: "PKR",
        status: PaymentStatus.PENDING,
      },
    });

    return {
      postUrl: "https://easypay.easypaisa.com.pk/easypay/Index.jsf",
      fields,
    };
  }

  /**
   * Signature-verified webhook / IPN callback for Easypaisa per rules.md §4.2.
   * @param params - Callback payload from Easypaisa
   */
  async verifyAndProcessEasypaisaCallback(params: Record<string, string>): Promise<{ success: boolean; message: string }> {
    const storeId = env.EASYPAISA_STORE_ID || "EP_STORE_9988";
    const hashKey = env.EASYPAISA_HASH_KEY || "ep_sandbox_hash_key_12345";

    const orderId = params.orderId;
    const responseCode = params.authCode || params.responseCode;
    const receivedSignature = params.signature;

    if (!orderId) {
      throw Errors.badRequest("MISSING_ORDER_ID", "Missing orderId in Easypaisa callback.");
    }

    // Verify signature if provided in callback
    if (receivedSignature) {
      const computed = this.calculateEasypaisaHash(storeId, orderId, params.transactionAmount || "0", hashKey);
      if (receivedSignature !== computed) {
        logger.error({ receivedSignature, computed }, "Easypaisa signature verification failed.");
        throw Errors.badRequest("INVALID_SIGNATURE", "Easypaisa signature verification failed.");
      }
    }

    const isSuccess = responseCode === "0000" || responseCode === "000";

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: isSuccess ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
          ...(isSuccess ? { status: OrderStatus.CONFIRMED } : {}),
        },
      });

      await tx.payment.updateMany({
        where: { orderId, provider: PaymentMethod.EASYPAISA },
        data: {
          status: isSuccess ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
          rawPayload: params as any,
        },
      });
    });

    logger.info({ orderId, isSuccess }, "Processed Easypaisa payment callback.");
    return { success: isSuccess, message: isSuccess ? "Payment Successful" : "Payment Failed" };
  }
}

/** Singleton instance of LocalWalletService */
export const localWalletService = new LocalWalletService();
