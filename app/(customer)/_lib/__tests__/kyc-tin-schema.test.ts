import { describe, expect, it } from "vitest";
import {
  countTinDigits,
  kycTinRequiredSchema,
  kycTinSchema,
  sanitizeTinInput,
} from "../kyc-tin-schema";

describe("kyc-tin-schema", () => {
  it("accepts empty TIN when optional", () => {
    expect(kycTinSchema.safeParse("").success).toBe(true);
    expect(kycTinSchema.safeParse("   ").success).toBe(true);
  });

  it("rejects empty TIN when required", () => {
    expect(kycTinRequiredSchema.safeParse("").success).toBe(false);
    expect(kycTinRequiredSchema.safeParse("   ").success).toBe(false);
  });

  it("accepts 13 digits with optional hyphens", () => {
    expect(kycTinSchema.safeParse("1234567890123").success).toBe(true);
    expect(kycTinSchema.safeParse("12345678-00012").success).toBe(true);
    expect(kycTinRequiredSchema.safeParse("1234567890123").success).toBe(true);
    expect(countTinDigits("12345678-00012")).toBe(13);
  });

  it("rejects TIN with wrong digit count when provided", () => {
    expect(kycTinSchema.safeParse("12345678901").success).toBe(false);
    expect(kycTinSchema.safeParse("12345678901234").success).toBe(false);
    expect(kycTinRequiredSchema.safeParse("12345678901").success).toBe(false);
  });

  it("sanitizes input to digits and hyphens only", () => {
    expect(sanitizeTinInput("12ab34-56")).toBe("1234-56");
  });
});
