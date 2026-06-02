import { CURRENCIES, type Currency } from "./constants";

export { CURRENCIES, type Currency };

const FLAG_CDN = "https://purecatamphetamine.github.io/country-flag-icons/3x2";

/**
 * Returns the URL for a currency flag image (SVG from CDN).
 * Uses countryCode from CURRENCIES (single source).
 */
export function getCurrencyFlagUrl(currencyCode: string): string | null {
  const currency = getCurrencyByCode(currencyCode);
  return currency?.countryCode ? `${FLAG_CDN}/${currency.countryCode}.svg` : null;
}

/**
 * Returns the display symbol for a currency code (e.g. "$" for USD).
 * Uses symbol from CURRENCIES (single source).
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);
  return currency?.symbol ?? currencyCode;
}

/**
 * Finds a currency by code from the CURRENCIES list.
 */
export function getCurrencyByCode(code: string): Currency | undefined {
  return CURRENCIES.find((c) => c.code === code);
}

export type FormattedCurrency = {
  symbol: string;
  value: string;
  formatted: string;
};

export type FormatCurrencyInput = string | Currency;

export type FormatCurrencyOptions = Omit<
  Intl.NumberFormatOptions,
  "style" | "currency" | "currencyDisplay"
> & {
  locale?: string;
};

function toCurrencyCode(currency: FormatCurrencyInput): string {
  return typeof currency === "string" ? currency : currency.code;
}

/**
 * Formats an amount using the symbol from {@link CURRENCIES} and locale number formatting.
 * Use `.formatted` for a single display string; use `.symbol` / `.value` when styling separately.
 */
export function formatCurrency(
  amount: number,
  currency: FormatCurrencyInput = "USD",
  options?: FormatCurrencyOptions
): FormattedCurrency {
  const currencyCode = toCurrencyCode(currency);
  const symbol = getCurrencySymbol(currencyCode);
  const {
    locale = "en-NG",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    ...numberOptions
  } = options ?? {};

  const value = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    ...numberOptions,
  }).format(amount);

  return { symbol, value, formatted: `${symbol}${value}` };
}

/** Nullable-safe display string (e.g. summary cards, tables). */
export function formatCurrencyAmount(
  value: number | null | undefined,
  currency: FormatCurrencyInput = "NGN",
  options?: FormatCurrencyOptions
): string {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return formatCurrency(Number(value), currency, options).formatted;
}
