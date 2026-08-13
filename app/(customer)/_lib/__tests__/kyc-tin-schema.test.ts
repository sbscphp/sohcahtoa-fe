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

  it("accepts 13 digits with optional hyphens (hyphen not counted)", () => {
    expect(kycTinSchema.safeParse("1234567890123").success).toBe(true);
    expect(kycTinSchema.safeParse("12345678-00012").success).toBe(true);
    expect(kycTinRequiredSchema.safeParse("1234567890123").success).toBe(true);
    expect(kycTinRequiredSchema.safeParse("12345678-00012").success).toBe(true);
    expect(kycTinRequiredSchema.safeParse("12-345-678-90123").success).toBe(true);
    expect(countTinDigits("12345678-00012")).toBe(13);
    expect(countTinDigits("12-345-678-90123")).toBe(13);
  });

  it("accepts pasted unicode dashes after sanitize/validate", () => {
    // en-dash / em-dash
    expect(sanitizeTinInput("12345678–00012")).toBe("12345678-00012");
    expect(sanitizeTinInput("12345678—00012")).toBe("12345678-00012");
    expect(kycTinRequiredSchema.safeParse("12345678–00012").success).toBe(true);
    expect(kycTinRequiredSchema.safeParse("12345678—00012").success).toBe(true);
  });

  it("rejects TIN with wrong digit count when provided", () => {
    expect(kycTinSchema.safeParse("12345678901").success).toBe(false);
    expect(kycTinRequiredSchema.safeParse("12345678901").success).toBe(false);
    // Common 8-4 FIRS display is 12 digits — not 13
    expect(kycTinRequiredSchema.safeParse("12345678-0001").success).toBe(false);
    // Input sanitize already caps at 13 digits, so longer digit strings normalize to valid
    expect(sanitizeTinInput("12345678901234")).toBe("1234567890123");
    expect(kycTinSchema.safeParse(sanitizeTinInput("12345678901234")).success).toBe(true);
  });

  it("sanitizes input to digits and hyphens only and caps at 13 digits", () => {
    expect(sanitizeTinInput("12ab34-56")).toBe("1234-56");
    expect(sanitizeTinInput("1234567890123456")).toBe("1234567890123");
    expect(sanitizeTinInput("1234567890123-99")).toBe("1234567890123-");
  });
});
