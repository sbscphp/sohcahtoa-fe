import { z } from "zod";

const TIN_MIN_DIGITS = 10;
const TIN_MAX_DIGITS = 13;
const TIN_INPUT_MAX_LENGTH = 16;

const UNICODE_DASHES = /[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g;

export function isMaskedTin(value: string): boolean {
  return value.includes("*");
}

export function countTinDigits(value: string): number {
  return value.replaceAll(/\D/g, "").length;
}

export function sanitizeTinInput(value: string): string {
  const normalized = value.replaceAll(UNICODE_DASHES, "-");

  if (isMaskedTin(normalized)) {
    return normalized.replaceAll(/[^\d\-*]/g, "");
  }

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
  const trimmed = value.trim();
  if (!trimmed) return allowEmpty;
  if (isMaskedTin(trimmed)) return true;

  const sanitized = sanitizeTinInput(trimmed);
  if (!sanitized) return allowEmpty;
  if (!/^[0-9-]+$/.test(sanitized)) return false;

  const digits = countTinDigits(sanitized);
  if (digits === 0) return false;

  return digits >= TIN_MIN_DIGITS && digits <= TIN_MAX_DIGITS;
}

const TIN_DIGIT_MESSAGE = `TIN Number must be ${TIN_MIN_DIGITS}–${TIN_MAX_DIGITS} digits. Hyphens are allowed and do not count.`;

export const kycTinSchema = z
  .string()
  .max(100, "TIN Number is too long")
  .refine(
    (value) => isValidTinValue(value, { allowEmpty: true }),
    TIN_DIGIT_MESSAGE
  );

export const kycTinRequiredSchema = z
  .string()
  .trim()
  .min(1, "TIN Number is required")
  .max(100, "TIN Number is too long")
  .refine(
    (value) => isValidTinValue(value, { allowEmpty: false }),
    TIN_DIGIT_MESSAGE
  );

export const TIN_INPUT_HELPER = `Enter ${TIN_MIN_DIGITS}–${TIN_MAX_DIGITS} digits (e.g. 08120451-1001). Hyphens do not count.`;
