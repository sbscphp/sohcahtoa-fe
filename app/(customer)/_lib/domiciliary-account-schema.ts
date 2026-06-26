import { z } from "zod";

function validateSwiftCode(swift: string, ctx: z.RefinementCtx) {
  const trimmed = swift.trim();
  if (!trimmed) {
    ctx.addIssue({
      code: "custom",
      path: ["swiftCode"],
      message: "SWIFT code is required",
    });
    return;
  }
  if (trimmed.length < 8 || trimmed.length > 11) {
    ctx.addIssue({
      code: "custom",
      path: ["swiftCode"],
      message: "SWIFT code must be 8–11 characters",
    });
  } else if (!/^[A-Za-z0-9]+$/.test(trimmed)) {
    ctx.addIssue({
      code: "custom",
      path: ["swiftCode"],
      message: "SWIFT code must be alphanumeric",
    });
  }
}

export const domiciliaryAccountSchema = z
  .object({
    domiciliaryAccountNumber: z
      .string()
      .trim()
      .min(1, "Domiciliary account number is required")
      .max(34, "Account number is too long"),
    domiciliaryBankName: z.string().trim().min(1, "Domiciliary bank name is required"),
    accountName: z.string().trim().min(1, "Account name is required"),
    swiftCode: z.string().trim(),
    routingNumber: z.string().trim().min(1, "Routing number is required"),
    bankAddress: z.string().trim().min(1, "Bank address is required"),
  })
  .superRefine((data, ctx) => {
    validateSwiftCode(data.swiftCode, ctx);
  });

export type DomiciliaryAccountFormData = z.infer<typeof domiciliaryAccountSchema>;

export function domiciliaryAccountInitialValues(
  initial?: Partial<DomiciliaryAccountFormData>
): DomiciliaryAccountFormData {
  return {
    domiciliaryAccountNumber: (initial?.domiciliaryAccountNumber ?? "").trim(),
    domiciliaryBankName: (initial?.domiciliaryBankName ?? "").trim(),
    accountName: (initial?.accountName ?? "").trim(),
    swiftCode: (initial?.swiftCode ?? "").trim().toUpperCase(),
    routingNumber: (initial?.routingNumber ?? "").trim(),
    bankAddress: (initial?.bankAddress ?? "").trim(),
  };
}
