import { z } from "zod";

/** Nigerian TIN — typically 10–13 digits; QoreID sample `08120451-1001` is 12. */
const TIN_MIN_DIGITS = 10;
const TIN_MAX_DIGITS = 13;
/** Input cap (digits + optional hyphens). */
const TIN_INPUT_MAX_LENGTH = 16;

/** Unicode dashes people paste from Word/Docs/PDF → ASCII hyphen. */
const UNICODE_DASHES = /[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g;

export function countTinDigits(value: string): number {
  return value.replaceAll(/\D/g, "").length;
}

/**
 * Keep digits + hyphens only.
 * Hyphens never count toward the digit limit.
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
      if (digitCount >= TIN_MAX_DIGITS) continue;
      result += char;
      digitCount += 1;
    }
  }

  return result.slice(0, TIN_INPUT_MAX_LENGTH);
}

function isValidTinValue(value: string, { allowEmpty }: { allowEmpty: boolean }): boolean {
  const trimmed = sanitizeTinInput(value).trim();
  if (!trimmed) return allowEmpty;
  if (!/^[0-9-]+$/.test(trimmed)) return false;

  const digits = countTinDigits(trimmed);
  if (digits === 0) return false;

  return digits >= TIN_MIN_DIGITS && digits <= TIN_MAX_DIGITS;
}

const TIN_DIGIT_MESSAGE = `TIN Number must be ${TIN_MIN_DIGITS}–${TIN_MAX_DIGITS} digits. Hyphens are allowed and do not count.`;

/** Optional TIN — empty allowed; when present must be 10–13 digits. */
export const kycTinSchema = z
  .string()
  .max(TIN_INPUT_MAX_LENGTH, "TIN Number is too long")
  .refine(
    (value) => isValidTinValue(value, { allowEmpty: true }),
    TIN_DIGIT_MESSAGE
  );

/** Required TIN for flows that mandate Tax Identification Number (e.g. BTA). */
export const kycTinRequiredSchema = z
  .string()
  .trim()
  .min(1, "TIN Number is required")
  .max(TIN_INPUT_MAX_LENGTH, "TIN Number is too long")
  .refine(
    (value) => isValidTinValue(value, { allowEmpty: false }),
    TIN_DIGIT_MESSAGE
  );

export const TIN_INPUT_HELPER = `Enter ${TIN_MIN_DIGITS}–${TIN_MAX_DIGITS} digits (e.g. 08120451-1001). Hyphens do not count.`;
