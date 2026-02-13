/**
 * Returns the USD amount as a number when one of the currencies is USD.
 * Used to show "proof of fund" prompt when amount > 10,000 USD.
 */
export function getUsdAmount(
  receiveAmount: string,
  receiveCurrency: string,
  sendAmount: string,
  sendCurrency: string
): number {
  const receive = receiveCurrency.toUpperCase() === "USD" ? parseFloat(receiveAmount) : NaN;
  const send = sendCurrency.toUpperCase() === "USD" ? parseFloat(sendAmount) : NaN;
  const usd = Number.isFinite(receive) ? receive : Number.isFinite(send) ? send : 0;
  return usd;
}

export function isAmountOver10k(
  receiveAmount: string,
  receiveCurrency: string,
  sendAmount: string,
  sendCurrency: string
): boolean {
  return getUsdAmount(receiveAmount, receiveCurrency, sendAmount, sendCurrency) > 10_000;
}
