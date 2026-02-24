import { format } from "date-fns";

/**
 * Formats a date string in local time without timezone offset issues
 * @param date - ISO date string, Date object, or date string from API
 * @param formatString - date-fns format string (e.g., "MMMM d, yyyy")
 * @returns Formatted date string in local time
 */
export function formatLocalDate(
  date: string | Date | null | undefined,
  formatString = ''
): string {
  if (!date) return "";

  // If it's already a Date object, format it directly
  if (date instanceof Date) {
    return format(date, formatString);
  }

  // Convert to string if needed
  const dateString = String(date);

  // Parse the date string as local time by removing timezone info
  // This prevents the browser from applying timezone offsets
  const cleanedDate = dateString.replace(/[TZ]/g, " ").trim();
  const [datePart, timePart] = cleanedDate.split(" ");
  
  if (!datePart) return "";

  // Split date components
  const [year, month, day] = datePart.split("-").map(Number);
  
  // Split time components if available
  let hours = 0, minutes = 0, seconds = 0;
  if (timePart) {
    const timeComponents = timePart.split(":");
    hours = Number(timeComponents[0]) || 0;
    minutes = Number(timeComponents[1]) || 0;
    seconds = Number(timeComponents[2]?.split(".")[0]) || 0;
  }

  // Create date object in local timezone
  const localDate = new Date(year, month - 1, day, hours, minutes, seconds);

  return format(localDate, formatString);
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