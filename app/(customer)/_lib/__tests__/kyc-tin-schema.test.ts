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

  it("accepts TIN between 10 and 13 digits with optional hyphen", () => {
    expect(kycTinSchema.safeParse("08120451-1001").success).toBe(true);
    expect(kycTinSchema.safeParse("1234567890").success).toBe(true);
    expect(kycTinSchema.safeParse("1234567890123").success).toBe(true);
    expect(kycTinRequiredSchema.safeParse("08120451-1001").success).toBe(true);
    expect(countTinDigits("08120451-1001")).toBe(12);
  });

  it("accepts pasted unicode dashes after sanitize/validate", () => {
    expect(sanitizeTinInput("08120451–1001")).toBe("08120451-1001");
    expect(kycTinRequiredSchema.safeParse("08120451–1001").success).toBe(true);
  });

  it("rejects TIN outside 10–13 digits", () => {
    expect(kycTinSchema.safeParse("123456789").success).toBe(false);
    expect(kycTinRequiredSchema.safeParse("123456789").success).toBe(false);
    // Extra digits are capped on sanitize; 14 raw digits normalize to valid 13
    expect(sanitizeTinInput("12345678901234")).toBe("1234567890123");
    expect(kycTinRequiredSchema.safeParse("12345678901234").success).toBe(true);
  });

  it("sanitizes input to digits and hyphens only and caps at 13 digits", () => {
    expect(sanitizeTinInput("08ab120451-1001")).toBe("08120451-1001");
    expect(sanitizeTinInput("1234567890123456")).toBe("1234567890123");
  });
});
