import { format } from "date-fns";

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Parses API ISO strings as wall-clock local time (ignores Z/offset conversion).
 */
export function parseApiDateTimeAsLocal(
  date: string | Date | null | undefined
): Date | null {
  if (!date) return null;

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const cleanedDate = String(date).replace(/[TZ]/g, " ").trim();
  const [datePart, timePart] = cleanedDate.split(/\s+/);

  if (!datePart) return null;

  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return null;

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
  return Number.isNaN(localDate.getTime()) ? null : localDate;
}

/** Splits API ISO into YYYY-MM-DD and HH:mm for date/time form inputs. */
export function splitApiDateTimeForInput(iso: string | null | undefined): {
  date: string | null;
  time: string;
} {
  if (!iso) return { date: null, time: "" };

  const cleanedDate = String(iso).replace(/[TZ]/g, " ").trim();
  const [datePart, timePart] = cleanedDate.split(/\s+/);

  if (!datePart) return { date: null, time: "" };

  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return { date: null, time: "" };

  const date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  if (!timePart) return { date, time: "" };

  const [hoursRaw, minutesRaw] = timePart.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return { date, time: "" };

  return { date, time: `${pad2(hours)}:${pad2(minutes)}` };
}

export function parseTimeInput(
  time: string
): { hours: number; minutes: number; seconds: number } | null {
  const trimmed = time.trim();
  if (!trimmed) return null;

  const amPmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])$/);
  const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  if (amPmMatch) {
    const h = Number(amPmMatch[1]);
    const m = Number(amPmMatch[2]);
    const s = Number(amPmMatch[3] ?? "0");
    const meridiem = amPmMatch[4].toUpperCase();
    if (h < 1 || h > 12 || m > 59 || s > 59) return null;
    let hours = h % 12;
    if (meridiem === "PM") hours += 12;
    return { hours, minutes: m, seconds: s };
  }

  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);
    const seconds = Number(twentyFourHourMatch[3] ?? "0");
    if (hours > 23 || minutes > 59 || seconds > 59) return null;
    return { hours, minutes, seconds };
  }

  return null;
}

/** Builds API ISO string preserving wall-clock values (no timezone shift). */
export function buildApiDateTimeIso(date: string | null, time: string): string | null {
  if (!date || !time.trim()) return null;

  const parsedTime = parseTimeInput(time);
  if (!parsedTime) return null;

  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return null;

  const { hours, minutes, seconds } = parsedTime;
  return `${year}-${pad2(month)}-${pad2(day)}T${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}.000Z`;
}

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

  const localDate = parseApiDateTimeAsLocal(date);
  if (!localDate) return "";

  const safeFormat =
    typeof formatString === "string" && formatString.trim().length > 0
      ? formatString
      : "d MMM yyyy";

  return format(localDate, safeFormat);
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