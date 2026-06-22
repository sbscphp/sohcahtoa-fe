import type {
  CalculateTransactionRateData,
  TransactionRateMode,
} from "@/app/_lib/api/types";

export type { TransactionRateMode };

export function getActiveRate(
  data: Pick<CalculateTransactionRateData, "buyRate" | "sellRate">,
  mode: TransactionRateMode
): number {
  return mode === "buy" ? data.buyRate : data.sellRate;
}

export function formatExchangeRateLabel(
  fromCurrency: string,
  toCurrency: string,
  rate: number
): string {
  return `${fromCurrency}1 - ${rate} ${toCurrency}`;
}

export const RATE_UNAVAILABLE_LABEL = "Rate unavailable";
