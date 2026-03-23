/**
 * Returns the USD amount as a number when one of the currencies is USD.
 * Used to show "proof of fund" prompt when amount >= 10,000 USD.
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

export function isAmountOver10k(
  receiveAmount: string,
  receiveCurrency: string,
  sendAmount: string,
  sendCurrency: string
): boolean {
  return getUsdAmount(receiveAmount, receiveCurrency, sendAmount, sendCurrency) >= 10000;
}
