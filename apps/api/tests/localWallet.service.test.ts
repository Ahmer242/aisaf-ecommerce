/**
 * @file localWallet.service.test.ts
 * @description Unit tests for local wallet (JazzCash & Easypaisa) signature generation & verification.
 */

import { describe, expect, it } from "vitest";
import { LocalWalletService } from "../src/modules/payment/localWallet.service.ts";

describe("LocalWalletService signature calculations", () => {
  const service = new LocalWalletService();

  it("calculates JazzCash SecureHash consistently using HMAC-SHA256", () => {
    const params = {
      pp_Version: "1.1",
      pp_TxnType: "MWALLET",
      pp_MerchantID: "MC_123",
      pp_Password: "pass",
      pp_TxnRefNo: "T9988",
      pp_Amount: "100000",
      pp_TxnCurrency: "PKR",
    };
    const salt = "test_salt_key";

    const hash1 = service.calculateJazzCashSecureHash(params, salt);
    const hash2 = service.calculateJazzCashSecureHash(params, salt);

    expect(hash1).toBeDefined();
    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe("string");
  });

  it("calculates Easypaisa hash token", () => {
    const storeId = "EP_STORE_1";
    const orderId = "ORD_555";
    const amount = "1500.00";
    const hashKey = "ep_secret_key";

    const hash = service.calculateEasypaisaHash(storeId, orderId, amount, hashKey);
    expect(hash).toBeDefined();
    expect(hash.length).toBeGreaterThan(10);
  });
});
