import { z } from "zod";

const TIN_DIGIT_MIN = 11;
const TIN_DIGIT_MAX = 13;
const TIN_MAX_LENGTH = 30;

export function countTinDigits(value: string): number {
  return value.replaceAll(/\D/g, "").length;
}

function validateTinDigitCount(value: string): boolean {
  const count = countTinDigits(value);
  return count >= TIN_DIGIT_MIN && count <= TIN_DIGIT_MAX;
}

export const kycTinSchema = z
  .string()
  .min(1, "TIN Number is required")
  .max(TIN_MAX_LENGTH, "TIN Number is too long")
  .refine(
    validateTinDigitCount,
    `TIN Number must contain ${TIN_DIGIT_MIN} to ${TIN_DIGIT_MAX} digits`
  );
