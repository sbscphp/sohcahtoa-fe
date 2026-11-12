import { formatCurrencyAmount } from "@/app/(customer)/_lib/currency";
import { formatShortDate, formatShortTime } from "@/app/utils/helper/formatLocalDate";

/** Whole-number-friendly money: "$20,000", but keeps cents when present. */
export function formatMoney(value: number | null | undefined, currency: string): string {
  if (value == null) return formatCurrencyAmount(value, currency);
  const text = formatCurrencyAmount(Math.abs(value), currency, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  // Sign goes before the symbol: "-$11,000", not "$-11,000".
  return value < 0 ? `-${text}` : text;
}

/** Money with accounting-style negatives, e.g. `(£1,200)`. Null renders as an em dash. */
export function formatAccounting(value: number | null | undefined, currency: string): string {
  if (value == null) return "—";
  if (value < 0) return `(${formatMoney(Math.abs(value), currency)})`;
  return formatMoney(value, currency);
}

/** Signed money, e.g. `+$1,000` / `-$1,000`. */
export function formatSigned(value: number, currency: string): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatMoney(Math.abs(value), currency)}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatPlainNumber(value: number): string {
  return value.toLocaleString("en-NG");
}

export function splitDateTime(iso: string): { date: string; time: string } {
  return { date: formatShortDate(iso), time: formatShortTime(iso) };
}

export function formatDateTime(iso: string): string {
  const { date, time } = splitDateTime(iso);
  return `${date}, ${time}`;
}

export function isSameDay(iso: string, now = new Date()): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
