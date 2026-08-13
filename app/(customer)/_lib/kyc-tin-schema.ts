import { z } from "zod";

const TIN_DIGIT_COUNT = 13;
/** Room for hyphenated display (digits + hyphens). */
const TIN_MAX_LENGTH = 20;

/** Unicode dashes people paste from Word/Docs/PDF → ASCII hyphen. */
const UNICODE_DASHES = /[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g;

export function countTinDigits(value: string): number {
  return value.replaceAll(/\D/g, "").length;
}

/**
 * Keep digits + hyphens only.
 * Hyphens never count toward the 13-digit limit.
 * Extra digits beyond 13 are dropped; hyphens can still be typed.
 */
export function sanitizeTinInput(value: string): string {
  const normalized = value.replaceAll(UNICODE_DASHES, "-");
  let digitCount = 0;
  let result = "";

  for (const char of normalized) {
    if (char === "-") {
      result += char;
      continue;
    }
    if (char >= "0" && char <= "9") {
      if (digitCount >= TIN_DIGIT_COUNT) continue;
      result += char;
      digitCount += 1;
    }
  }

  return result.slice(0, TIN_MAX_LENGTH);
}

function isValidTinValue(value: string, { allowEmpty }: { allowEmpty: boolean }): boolean {
  // Normalize before validate so pasted en/em dashes still pass.
  const trimmed = sanitizeTinInput(value).trim();
  if (!trimmed) return allowEmpty;
  if (!/^[0-9-]+$/.test(trimmed)) return false;
  if (countTinDigits(trimmed) === 0) return false;
  return countTinDigits(trimmed) === TIN_DIGIT_COUNT;
}

const TIN_DIGIT_MESSAGE =
  `TIN Number must be exactly ${TIN_DIGIT_COUNT} digits. Hyphens are allowed and do not count.`;

/** Optional TIN — empty allowed; when present must be 13 digits (hyphens ok). */
export const kycTinSchema = z
  .string()
  .max(TIN_MAX_LENGTH, "TIN Number is too long")
  .refine(
    (value) => isValidTinValue(value, { allowEmpty: true }),
    TIN_DIGIT_MESSAGE
  );

/** Required TIN for flows that mandate Tax Identification Number (e.g. BTA). */
export const kycTinRequiredSchema = z
  .string()
  .trim()
  .min(1, "TIN Number is required")
  .max(TIN_MAX_LENGTH, "TIN Number is too long")
  .refine(
    (value) => isValidTinValue(value, { allowEmpty: false }),
    TIN_DIGIT_MESSAGE
  );

export const TIN_INPUT_HELPER =
  "Exactly 13 digits. You can include a hyphen — it does not count toward the 13.";
