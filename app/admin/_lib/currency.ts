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
