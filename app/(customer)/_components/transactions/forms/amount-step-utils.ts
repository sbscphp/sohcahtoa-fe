/**
 * Default proof-of-funds / source-of-funds threshold in foreign-currency units.
 * Override per currency below when product needs a different limit.
 */
export const DEFAULT_PROOF_OF_FUNDS_THRESHOLD = 10_000;

/**
 * Optional per-currency thresholds. Unlisted currencies use DEFAULT_PROOF_OF_FUNDS_THRESHOLD.
 * Example: EUR: 12_000
 */
export const PROOF_OF_FUNDS_THRESHOLD_BY_CURRENCY: Partial<Record<string, number>> = {
  USD: DEFAULT_PROOF_OF_FUNDS_THRESHOLD,
};

/**
 * Returns the proof-of-funds threshold for a foreign currency code.
 * Falls back to the shared default so 10_000 applies unless overridden.
 */
export function getProofOfFundsRequiredAmount(
  currency: string,
  fallback = DEFAULT_PROOF_OF_FUNDS_THRESHOLD
): number {
  const code = currency.trim().toUpperCase();
  if (!code || code === "NGN") return fallback;

  const configured = PROOF_OF_FUNDS_THRESHOLD_BY_CURRENCY[code];
  return typeof configured === "number" && Number.isFinite(configured)
    ? configured
    : fallback;
}

/**
 * Returns the foreign (non-NGN) amount for threshold checks like proof of funds.
 * Buy flows are typically NGN → FX; sell flows are FX → NGN.
 */
export function getForeignCurrencyAmount(
  receiveAmount: string,
  receiveCurrency: string,
  sendAmount: string,
  sendCurrency: string
): number {
  const receiveSanitized = receiveAmount.replaceAll(",", "");
  const sendSanitized = sendAmount.replaceAll(",", "");

  const receiveCode = receiveCurrency.trim().toUpperCase();
  const sendCode = sendCurrency.trim().toUpperCase();

  const receive =
    receiveCode && receiveCode !== "NGN"
      ? Number.parseFloat(receiveSanitized)
      : Number.NaN;
  const send =
    sendCode && sendCode !== "NGN"
      ? Number.parseFloat(sendSanitized)
      : Number.NaN;

  if (Number.isFinite(receive)) return receive;
  if (Number.isFinite(send)) return send;
  return 0;
}

/** Foreign currency code used for threshold lookup (non-NGN side). */
export function getForeignCurrencyCode(
  receiveCurrency: string,
  sendCurrency: string
): string {
  const receiveCode = receiveCurrency.trim().toUpperCase();
  const sendCode = sendCurrency.trim().toUpperCase();
  if (receiveCode && receiveCode !== "NGN") return receiveCode;
  if (sendCode && sendCode !== "NGN") return sendCode;
  return "USD";
}

/** @deprecated Use getForeignCurrencyAmount — kept for older call sites. */
export function getUsdAmount(
  receiveAmount: string,
  receiveCurrency: string,
  sendAmount: string,
  sendCurrency: string
): number {
  return getForeignCurrencyAmount(
    receiveAmount,
    receiveCurrency,
    sendAmount,
    sendCurrency
  );
}

/**
 * Whether the FX amount exceeds the required proof-of-funds threshold.
 * Uses the foreign currency’s configured threshold, defaulting to 10_000.
 */
export function isAmountOverRequiredAmount(
  receiveAmount: string,
  receiveCurrency: string,
  sendAmount: string,
  sendCurrency: string,
  requiredAmount?: number
): boolean {
  const foreignCurrency = getForeignCurrencyCode(receiveCurrency, sendCurrency);
  const threshold =
    requiredAmount ?? getProofOfFundsRequiredAmount(foreignCurrency);

  return (
    getForeignCurrencyAmount(
      receiveAmount,
      receiveCurrency,
      sendAmount,
      sendCurrency
    ) >= Number(threshold)
  );
}
