/**
 * Number and currency formatting utilities for the Admin app.
 * Uses Intl.NumberFormat for locale-aware formatting.
 */

interface FormatNumberOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  compact?: boolean;
}

/**
 * Formats a number with thousand separators and optional decimal control.
 *
 * @example
 * formatNumber(15000)        // "15,000"
 * formatNumber(15000.5)      // "15,000.5"
 * formatNumber(1500000, { compact: true }) // "1.5M"
 */
export function formatNumber(
  value: number | string | null | undefined,
  options: FormatNumberOptions = {}
): string {
  if (value === null || value === undefined || value === "") return "0";

  const num = typeof value === "string" ? Number(value) : value;
  if (isNaN(num)) return "0";

  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    compact = false,
  } = options;

  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits,
    maximumFractionDigits,
    ...(compact && { notation: "compact", compactDisplay: "short" }),
  }).format(num);
}

interface FormatCurrencyOptions {
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  compact?: boolean;
  symbolOnly?: boolean;
}

/**
 * Formats a value as currency. Defaults to Nigerian Naira (₦).
 *
 * @example
 * formatCurrency(5000)                         // "₦5,000.00"
 * formatCurrency(5000, { currency: "USD" })     // "$5,000.00"
 * formatCurrency(1500000, { compact: true })    // "₦1.5M"
 * formatCurrency(5000, { minimumFractionDigits: 0 }) // "₦5,000"
 */
export function formatCurrency(
  value: number | string | null | undefined,
  options: FormatCurrencyOptions = {}
): string {
  if (value === null || value === undefined || value === "") return "₦0.00";

  const num = typeof value === "string" ? Number(value) : value;
  if (isNaN(num)) return "₦0.00";

  const {
    currency = "NGN",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    compact = false,
  } = options;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits,
    maximumFractionDigits,
    ...(compact && { notation: "compact", compactDisplay: "short" }),
  }).format(num);
}

/**
 * Parses a formatted currency/number string back to a raw number.
 * Useful for inputs that display formatted values.
 *
 * @example
 * parseCurrencyInput("₦5,000.00") // 5000
 * parseCurrencyInput("1,234")      // 1234
 */
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
}
