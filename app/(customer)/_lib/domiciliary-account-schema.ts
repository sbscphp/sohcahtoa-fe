import { z } from "zod";
import {
  INPUT_LIMITS,
  INPUT_PATTERNS,
  constrainedTextFieldSchema,
  digitsFieldSchema,
  sanitizeBankAccountNumber,
  sanitizeBankName,
  sanitizeIban,
  sanitizePersonName,
  sanitizePostalAddress,
  sanitizeRoutingNumber,
  sanitizeSwiftCode,
  swiftCodeFieldSchema,
} from "@/app/_lib/input-field-rules";

export const domiciliaryAccountSchema = z
  .object({
    domiciliaryAccountNumber: digitsFieldSchema({
      label: "Domiciliary account number",
      min: INPUT_LIMITS.bankAccountNumberMin,
      max: INPUT_LIMITS.bankAccountNumber,
    }),
    domiciliaryBankName: constrainedTextFieldSchema({
      label: "Domiciliary bank name",
      min: INPUT_LIMITS.bankNameMin,
      max: INPUT_LIMITS.bankName,
      pattern: INPUT_PATTERNS.bankName,
      patternMessage: "Bank name can only contain letters, numbers, spaces, and . ' & -",
    }),
    accountName: constrainedTextFieldSchema({
      label: "Account name",
      min: INPUT_LIMITS.personNameMin,
      max: INPUT_LIMITS.personName,
      pattern: INPUT_PATTERNS.personName,
      patternMessage: "Account name can only contain letters, spaces, and . ' -",
    }),
    swiftCode: swiftCodeFieldSchema(),
    /** Optional — required for some foreign banks (e.g. UK). */
    iban: z.string(),
    routingNumber: digitsFieldSchema({
      label: "Routing number",
      min: INPUT_LIMITS.routingNumberMin,
      max: INPUT_LIMITS.routingNumberGeneric,
    }),
    bankAddress: constrainedTextFieldSchema({
      label: "Bank address",
      min: INPUT_LIMITS.postalAddressMin,
      max: INPUT_LIMITS.postalAddress,
      pattern: INPUT_PATTERNS.postalAddress,
      patternMessage: "Bank address can only contain letters, numbers, spaces, and . , # / -",
    }),
  })
  .superRefine((data, ctx) => {
    const iban = sanitizeIban(data.iban);
    if (!iban) return;
    if (iban.length < INPUT_LIMITS.ibanMin || iban.length > INPUT_LIMITS.iban) {
      ctx.addIssue({
        code: "custom",
        path: ["iban"],
        message: "Enter a valid IBAN",
      });
    }
  });

export type DomiciliaryAccountFormData = z.infer<typeof domiciliaryAccountSchema>;

export function domiciliaryAccountInitialValues(
  initial?: Partial<DomiciliaryAccountFormData>
): DomiciliaryAccountFormData {
  return {
    domiciliaryAccountNumber: sanitizeBankAccountNumber(initial?.domiciliaryAccountNumber ?? ""),
    domiciliaryBankName: sanitizeBankName(initial?.domiciliaryBankName ?? ""),
    accountName: sanitizePersonName(initial?.accountName ?? ""),
    swiftCode: sanitizeSwiftCode(initial?.swiftCode ?? ""),
    iban: sanitizeIban(initial?.iban ?? ""),
    routingNumber: sanitizeRoutingNumber(initial?.routingNumber ?? ""),
    bankAddress: sanitizePostalAddress(initial?.bankAddress ?? ""),
  };
}

// Re-export limits for UI maxLength props
export {
  INPUT_LIMITS as DOMICILIARY_INPUT_LIMITS,
  sanitizeBankAccountNumber as sanitizeDomiciliaryAccountNumber,
  sanitizeBankName as sanitizeDomiciliaryBankName,
  sanitizePersonName as sanitizeDomiciliaryAccountName,
  sanitizeSwiftCode as sanitizeDomiciliarySwiftCode,
  sanitizeIban as sanitizeDomiciliaryIban,
  sanitizeRoutingNumber as sanitizeDomiciliaryRoutingNumber,
  sanitizePostalAddress as sanitizeDomiciliaryBankAddress,
} from "@/app/_lib/input-field-rules";
