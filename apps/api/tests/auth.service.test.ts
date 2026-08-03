import { describe, expect, it } from "vitest";
import { AuthService } from "../src/modules/auth/auth.service.js";
import { Errors } from "../src/utils/AppError.js";
import { signAuthToken, verifyAuthToken } from "../src/utils/token.js";

describe("token utils", () => {
  it("signs and verifies a payload", () => {
    const token = signAuthToken({
      sub: "user_1",
      email: "a@b.com",
      role: "CUSTOMER",
      name: "A",
    });
    const payload = verifyAuthToken(token);
    expect(payload.sub).toBe("user_1");
    expect(payload.email).toBe("a@b.com");
    expect(payload.role).toBe("CUSTOMER");
  });

  it("rejects tampered tokens", () => {
    const token = signAuthToken({
      sub: "user_1",
      email: "a@b.com",
      role: "CUSTOMER",
      name: null,
    });
    expect(() => verifyAuthToken(`${token}x`)).toThrow();
  });
});

describe("AuthService mapping helpers via public errors", () => {
  it("exposes EMAIL_TAKEN conflict shape", () => {
    const err = Errors.conflict("EMAIL_TAKEN", "An account with this email already exists.");
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe("EMAIL_TAKEN");
  });

  it("constructs AuthService", () => {
    expect(new AuthService()).toBeInstanceOf(AuthService);
  });
});
