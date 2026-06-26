import { CURRENCIES } from "./constants";
import { getCurrencyByCode } from "./currency";
import type { TransactionOverviewRequest } from "@/app/_lib/api/types";

/** Body for POST /api/customer/transactions/totals */
export function buildTransactionOverviewRequest(currencyCode: string): TransactionOverviewRequest {
  const currency = getCurrencyByCode(currencyCode) ?? CURRENCIES[0];

  return {
    currency: currency.code,
    customRates: [
      {
        currency: currency.code,
        rate: currency.rate ?? 1,
      },
    ],
  };
}
