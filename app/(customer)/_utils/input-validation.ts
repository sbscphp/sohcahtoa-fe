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
  ctx: z.RefinementCtx
) {
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
      path: ["passportIssueDate"],
      message: "Passport Issued Date is invalid",
    });
  }

  if (Number.isNaN(expiryDate.getTime())) {
    ctx.addIssue({
      code: "custom",
      path: ["passportExpiryDate"],
      message: "Passport Expiry Date is invalid",
    });
  }

  if (Number.isNaN(issueDate.getTime()) || Number.isNaN(expiryDate.getTime())) return;

  if (issueDate > today) {
    ctx.addIssue({
      code: "custom",
      path: ["passportIssueDate"],
      message: "Passport Issued Date cannot be in the future",
    });
  }

  if (expiryDate <= today) {
    ctx.addIssue({
      code: "custom",
      path: ["passportExpiryDate"],
      message: "Passport Expiry Date must be in the future",
    });
  }

  if (expiryDate <= issueDate) {
    ctx.addIssue({
      code: "custom",
      path: ["passportExpiryDate"],
      message: "Passport Expiry Date must be after Passport Issued Date",
    });
  }
}

export function formatDateToIso(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().split("T")[0] ?? "";
}
