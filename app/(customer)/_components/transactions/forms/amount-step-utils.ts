/**
 * Returns the USD amount as a number when one of the currencies is USD.
 * Used for proof-of-fund prompts when amount meets or exceeds the flow-specific threshold.
 */
export function getUsdAmount(
  receiveAmount: string,
  receiveCurrency: string,
  sendAmount: string,
  sendCurrency: string
): number {
  const receiveSanitized = receiveAmount.replaceAll(",", "");
  const sendSanitized = sendAmount.replaceAll(",", "");

  const receive =
    receiveCurrency.toUpperCase() === "USD"
      ? Number.parseFloat(receiveSanitized)
      : Number.NaN;
  const send =
    sendCurrency.toUpperCase() === "USD"
      ? Number.parseFloat(sendSanitized)
      : Number.NaN;
  if (Number.isFinite(receive)) return receive;
  if (Number.isFinite(send)) return send;
  return 0;
}

export function isAmountOverRequiredAmount(
  receiveAmount: string,
  receiveCurrency: string,
  sendAmount: string,
  sendCurrency: string,
  requiredAmount = 10000
): boolean {
  return getUsdAmount(receiveAmount, receiveCurrency, sendAmount, sendCurrency) >= Number(requiredAmount);
}
