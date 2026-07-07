import { z } from "zod";

const TIN_DIGIT_COUNT = 13;
/** Room for hyphenated formats (e.g. 12345678-0001). */
const TIN_MAX_LENGTH = 20;

export function countTinDigits(value: string): number {
  return value.replaceAll(/\D/g, "").length;
}

export function sanitizeTinInput(value: string): string {
  return value.replaceAll(/[^0-9-]/g, "").slice(0, TIN_MAX_LENGTH);
}

function isValidTinValue(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;

  if (!/^[0-9-]+$/.test(trimmed)) return false;

  return countTinDigits(trimmed) === TIN_DIGIT_COUNT;
}

export const kycTinSchema = z
  .string()
  .max(TIN_MAX_LENGTH, "TIN Number is too long")
  .refine(
    isValidTinValue,
    `TIN Number must be ${TIN_DIGIT_COUNT} digits (hyphens allowed)`
  );
