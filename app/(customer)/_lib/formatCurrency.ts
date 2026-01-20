/**
 * Formats a number as currency using Intl.NumberFormat.
 * Returns symbol, value (numeric part only), and full formatted string.
 * Use .formatted when you need a single string; use .symbol and .value when styling them separately (e.g. symbol in a badge).
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = "USD",
  overrides?: Intl.NumberFormatOptions
): { symbol: string; value: string; formatted: string } {
  const opts = {
    style: "currency" as const,
    currency: currencyCode,
    currencyDisplay: "narrowSymbol" as const,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...overrides,
  };
  const formatter = new Intl.NumberFormat(undefined, opts);
  const formatted = formatter.format(amount);
  const parts = formatter.formatToParts(amount);
  const symbol = parts.find((p) => p.type === "currency")?.value ?? currencyCode;
  const value = parts
    .filter((p) => p.type !== "currency" && p.type !== "literal")
    .map((p) => p.value)
    .join("");
  return { symbol, value, formatted };
}
