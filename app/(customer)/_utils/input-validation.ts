import { z } from "zod";

export const PASSPORT_NUMBER_REGEX = /^[A-Z0-9]+$/;

export const passportNumberSchema = z
  .string()
  .trim()
  .min(1, "International Passport Number is required")
  .max(9, "International Passport Number must be at most 9 characters")
  .regex(PASSPORT_NUMBER_REGEX, "International Passport Number must be alphanumeric");

export const requiredIsoDateSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`);

function toUtcDate(dateString: string) {
  const trimmed = dateString.trim();
  if (!trimmed) return new Date("");

  const isoLike = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
  if (isoLike) return new Date(`${trimmed}T00:00:00.000Z`);

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return parsed;
  parsed.setUTCHours(0, 0, 0, 0);
  return parsed;
}

export function validatePassportDates(
  data: { passportIssueDate?: string; passportExpiryDate?: string },
  ctx: z.RefinementCtx,
  paths: { issueDate?: string; expiryDate?: string } = {}
) {
  const issuePath = paths.issueDate ?? "passportIssueDate";
  const expiryPath = paths.expiryDate ?? "passportExpiryDate";
  const issue = data.passportIssueDate?.trim() ?? "";
  const expiry = data.passportExpiryDate?.trim() ?? "";
  if (!issue || !expiry) return;

  const issueDate = toUtcDate(issue);
  const expiryDate = toUtcDate(expiry);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (Number.isNaN(issueDate.getTime())) {
    ctx.addIssue({
      code: "custom",
      path: [issuePath],
      message: "Passport Issued Date is invalid",
    });
  }

  if (Number.isNaN(expiryDate.getTime())) {
    ctx.addIssue({
      code: "custom",
      path: [expiryPath],
      message: "Passport Expiry Date is invalid",
    });
  }

  if (Number.isNaN(issueDate.getTime()) || Number.isNaN(expiryDate.getTime())) return;

  if (issueDate > today) {
    ctx.addIssue({
      code: "custom",
      path: [issuePath],
      message: "Passport Issued Date cannot be in the future",
    });
  }

  if (expiryDate <= today) {
    ctx.addIssue({
      code: "custom",
      path: [expiryPath],
      message: "Passport Expiry Date must be in the future",
    });
  }

  if (expiryDate <= issueDate) {
    ctx.addIssue({
      code: "custom",
      path: [expiryPath],
      message: "Passport Expiry Date must be after Passport Issued Date",
    });
  }
}

export function validateOptionalPassportFields(
  data: {
    passportDocumentNumber?: string;
    passportIssueDate?: string;
    passportExpiryDate?: string;
  },
  ctx: z.RefinementCtx
) {
  const passportNum = data.passportDocumentNumber?.trim() ?? "";
  if (passportNum) {
    const result = passportNumberSchema.safeParse(passportNum);
    if (!result.success) {
      ctx.addIssue({
        code: "custom",
        path: ["passportDocumentNumber"],
        message:
          result.error.issues[0]?.message ?? "International Passport Number is invalid",
      });
    }
  }

  const issue = data.passportIssueDate?.trim() ?? "";
  const expiry = data.passportExpiryDate?.trim() ?? "";
  if (issue && !expiry) {
    ctx.addIssue({
      code: "custom",
      path: ["passportExpiryDate"],
      message: "Passport Expiry Date is required when issue date is provided",
    });
  }
  if (expiry && !issue) {
    ctx.addIssue({
      code: "custom",
      path: ["passportIssueDate"],
      message: "Passport Issued Date is required when expiry date is provided",
    });
  }

  validatePassportDates(data, ctx);
}

export function formatDateToIso(date: Date | string | null): string {
  if (date == null || date === "") return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0] ?? "";
}

/** Shared field sanitizers, limits, and Zod builders — see `@/app/_lib/input-field-rules`. */
export {
  bindSanitizedInput,
  constrainedTextFieldSchema,
  digitsFieldSchema,
  INPUT_LIMITS,
  INPUT_PATTERNS,
  sanitizeAlphanumeric,
  sanitizeBankAccountNumber,
  sanitizeBankName,
  sanitizeDigits,
  sanitizeElevenDigitId,
  sanitizeNgnAccountNumber,
  sanitizePersonName,
  sanitizePostalAddress,
  sanitizeRoutingNumber,
  sanitizeSearchQuery,
  sanitizeSwiftCode,
  swiftCodeFieldSchema,
} from "@/app/_lib/input-field-rules";
