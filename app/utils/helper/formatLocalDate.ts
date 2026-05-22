import { format, isValid } from "date-fns";

const TIME_ONLY_RE = /^\d{1,2}:\d{2}(\s*(AM|PM))?$/i;
const ISO_DATE_PREFIX_RE = /^\d{4}-\d{2}-\d{2}/;

function safeFormatDate(date: Date, formatString: string): string {
  if (!isValid(date)) return "";
  return format(date, formatString);
}

/**
 * Formats a date string in local time without timezone offset issues
 * @param date - ISO date string, Date object, or date string from API
 * @param formatString - date-fns format string (e.g., "MMMM d, yyyy")
 * @returns Formatted date string in local time
 */
export function formatLocalDate(
  date: string | Date | null | undefined,
  formatString = ""
): string {
  if (!date) return "";

  const safeFormat =
    typeof formatString === "string" && formatString.trim().length > 0
      ? formatString
      : "d MMM yyyy";

  if (date instanceof Date) {
    return safeFormatDate(date, safeFormat);
  }

  const dateString = String(date).trim();
  if (!dateString) return "";

  // Pickup / API time labels (e.g. "10:00 AM") — not a calendar instant
  if (TIME_ONLY_RE.test(dateString)) {
    return dateString;
  }

  const parsedMs = Date.parse(dateString);
  if (Number.isFinite(parsedMs) && ISO_DATE_PREFIX_RE.test(dateString)) {
    return safeFormatDate(new Date(parsedMs), safeFormat);
  }

  const cleanedDate = dateString.replace(/[TZ]/g, " ").trim();
  const [datePart, timePart] = cleanedDate.split(" ");

  if (!datePart || !ISO_DATE_PREFIX_RE.test(datePart)) {
    return "";
  }

  const [year, month, day] = datePart.split("-").map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return "";
  }

  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  if (timePart) {
    const timeComponents = timePart.split(":");
    hours = Number(timeComponents[0]) || 0;
    minutes = Number(timeComponents[1]) || 0;
    seconds = Number(timeComponents[2]?.split(".")[0]) || 0;
  }

  const localDate = new Date(year, month - 1, day, hours, minutes, seconds);
  return safeFormatDate(localDate, safeFormat);
}

/** Date + time for headers (e.g. "23 Feb 2026 | 11:46 am"). Uses date-fns. */
export function formatHeaderDateTime(date: string | Date | null | undefined): string {
  const datePart = formatLocalDate(date, "d MMM yyyy");
  const timePart = formatLocalDate(date, "h:mm a");
  if (!datePart || !timePart) return "";
  return `${datePart} | ${timePart}`;
}

/** Short date only (e.g. "23 Feb 2026"). Uses date-fns. */
export function formatShortDate(date: string | Date | null | undefined): string {
  return formatLocalDate(date, "d MMM yyyy");
}

/** Short time only (e.g. "11:46 am"). Uses date-fns. */
export function formatShortTime(date: string | Date | null | undefined): string {
  return formatLocalDate(date, "h:mm a");
}
