import type { ChangeEvent } from "react";
import { z } from "zod";

/** Shared length caps — use in sanitizers, maxLength, and Zod schemas. */
export const INPUT_LIMITS = {
  ngnAccountNumber: 10,
  bvn: 11,
  bankAccountNumber: 34,
  bankAccountNumberMin: 5,
  routingNumberUs: 9,
  routingNumberGeneric: 11,
  routingNumberMin: 5,
  swiftCode: 11,
  swiftCodeMin: 8,
  bankName: 100,
  bankNameMin: 2,
  personName: 100,
  personNameMin: 2,
  postalAddress: 200,
  postalAddressMin: 5,
  passportNumber: 9,
  alphanumericId: 32,
  searchQuery: 100,
} as const;

/** Patterns for submit-time validation (values should already be sanitized). */
export const INPUT_PATTERNS = {
  digitsOnly: /^\d+$/,
  alphanumeric: /^[A-Za-z0-9]+$/,
  alphanumericUpper: /^[A-Z0-9]+$/,
  bankName: /^[A-Za-z0-9\s.'&-]+$/,
  personName: /^[A-Za-z\s.'-]+$/,
  postalAddress: /^[A-Za-z0-9\s.,#/-]+$/,
} as const;

/** Keeps digits only, capped at `maxLength`. */
export function sanitizeDigits(value: string, maxLength: number): string {
  return value.replaceAll(/\D/g, "").slice(0, maxLength);
}

/** Keeps letters and digits; optional uppercase. */
export function sanitizeAlphanumeric(
  value: string,
  maxLength: number,
  options?: { uppercase?: boolean }
): string {
  const cleaned = value.replaceAll(/[^A-Za-z0-9]/g, "").slice(0, maxLength);
  return options?.uppercase ? cleaned.toUpperCase() : cleaned;
}

/** Bank / organization names. */
export function sanitizeBankName(value: string, maxLength = INPUT_LIMITS.bankName): string {
  return value.replaceAll(/[^A-Za-z0-9\s.'&-]/g, "").slice(0, maxLength);
}

/** Person / account holder names. */
export function sanitizePersonName(value: string, maxLength = INPUT_LIMITS.personName): string {
  return value.replaceAll(/[^A-Za-z\s.'-]/g, "").slice(0, maxLength);
}

/** Street / bank address lines. */
export function sanitizePostalAddress(
  value: string,
  maxLength = INPUT_LIMITS.postalAddress
): string {
  return value.replaceAll(/[^A-Za-z0-9\s.,#/-]/g, "").slice(0, maxLength);
}

/** SWIFT / BIC codes. */
export function sanitizeSwiftCode(
  value: string,
  maxLength = INPUT_LIMITS.swiftCode
): string {
  return sanitizeAlphanumeric(value, maxLength, { uppercase: true });
}

/** Nigerian NGN account (10 digits). */
export function sanitizeNgnAccountNumber(value: string): string {
  return sanitizeDigits(value, INPUT_LIMITS.ngnAccountNumber);
}

/** BVN / NIN-style numeric ids (11 digits). */
export function sanitizeElevenDigitId(value: string): string {
  return sanitizeDigits(value, INPUT_LIMITS.bvn);
}

/** Generic international bank account number. */
export function sanitizeBankAccountNumber(value: string): string {
  return sanitizeDigits(value, INPUT_LIMITS.bankAccountNumber);
}

/** US routing (9) or generic routing (up to 11). */
export function sanitizeRoutingNumber(
  value: string,
  maxLength: number = INPUT_LIMITS.routingNumberGeneric
): string {
  return sanitizeDigits(value, maxLength);
}

/**
 * Client/API search boxes — strips control characters and caps length.
 * Keeps normal punctuation so names like O'Brien still match.
 */
export function sanitizeSearchQuery(
  value: string,
  maxLength: number = INPUT_LIMITS.searchQuery
): string {
  return value.replaceAll(/[\0\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").slice(0, maxLength);
}

type DigitsSchemaOptions = {
  label: string;
  min: number;
  max: number;
  exact?: number;
};

/** Zod string schema for numeric-only fields. */
export function digitsFieldSchema({ label, min, max, exact }: DigitsSchemaOptions) {
  let schema = z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .regex(INPUT_PATTERNS.digitsOnly, `${label} must contain digits only`);

  if (typeof exact === "number") {
    schema = schema.length(exact, `${label} must be exactly ${exact} digits`);
  } else {
    schema = schema
      .min(min, `${label} must be at least ${min} digits`)
      .max(max, `${label} cannot exceed ${max} digits`);
  }

  return schema;
}

type TextSchemaOptions = {
  label: string;
  min: number;
  max: number;
  pattern: RegExp;
  patternMessage: string;
};

/** Zod string schema for constrained text fields. */
export function constrainedTextFieldSchema({
  label,
  min,
  max,
  pattern,
  patternMessage,
}: TextSchemaOptions) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} cannot exceed ${max} characters`)
    .regex(pattern, patternMessage);
}

/** Zod schema for SWIFT / BIC with length + charset checks. */
export function swiftCodeFieldSchema(label = "SWIFT code") {
  return z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .min(
      INPUT_LIMITS.swiftCodeMin,
      `${label} must be at least ${INPUT_LIMITS.swiftCodeMin} characters`
    )
    .max(INPUT_LIMITS.swiftCode, `${label} cannot exceed ${INPUT_LIMITS.swiftCode} characters`)
    .regex(INPUT_PATTERNS.alphanumericUpper, `${label} must be alphanumeric`);
}

type SanitizedInputBinding = {
  maxLength: number;
  inputMode?: "numeric" | "text";
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

/**
 * Wire a Mantine input to a sanitizer + setter.
 *
 * @example
 * <TextInput
 *   {...form.getInputProps("accountNumber")}
 *   {...bindSanitizedInput(
 *     sanitizeNgnAccountNumber,
 *     (v) => form.setFieldValue("accountNumber", v),
 *     INPUT_LIMITS.ngnAccountNumber,
 *     "numeric",
 *   )}
 * />
 */
export function bindSanitizedInput(
  sanitizer: (value: string) => string,
  setValue: (value: string) => void,
  maxLength: number,
  inputMode?: "numeric" | "text",
  afterSanitize?: () => void
): SanitizedInputBinding {
  return {
    maxLength,
    inputMode,
    onChange: (event) => {
      setValue(sanitizer(event.currentTarget.value));
      afterSanitize?.();
    },
  };
}
