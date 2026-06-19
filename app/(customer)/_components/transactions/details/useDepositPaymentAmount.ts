import { useMemo } from "react";
import {
  resolveDepositPaymentAmount,
  type DepositPaymentAmountViewModel,
} from "@/app/(customer)/_utils/transaction-payment";

interface UseDepositPaymentAmountOptions {
  instructionsData?: unknown;
  instructionsLoading?: boolean;
  fallbackAmountNgn?: number | null;
  preferInstructions?: boolean;
}

export function useDepositPaymentAmount(
  options: UseDepositPaymentAmountOptions
): DepositPaymentAmountViewModel {
  const {
    instructionsData,
    instructionsLoading,
    fallbackAmountNgn,
    preferInstructions,
  } = options;

  return useMemo(
    () =>
      resolveDepositPaymentAmount({
        instructionsData,
        instructionsLoading,
        fallbackAmountNgn,
        preferInstructions,
      }),
    [instructionsData, instructionsLoading, fallbackAmountNgn, preferInstructions]
  );
}
