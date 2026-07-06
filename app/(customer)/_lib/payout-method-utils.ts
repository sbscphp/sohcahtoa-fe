import type { PayoutMethod } from "@/app/(customer)/_components/transactions/forms/PickupPointStep";

const DOMICILIARY_PAYOUT_METHODS = new Set<PayoutMethod>([
  "electronic_transfer_100",
  "electronic_75_cash_25",
]);

const PICKUP_PAYOUT_METHODS = new Set<PayoutMethod>([
  "card_100",
  "card_75_cash_25",
  "electronic_75_cash_25",
]);

const CASH_PORTION_PAYOUT_METHODS = new Set<PayoutMethod>([
  "card_75_cash_25",
  "electronic_75_cash_25",
]);

export function payoutMethodRequiresDomiciliaryAccount(
  payoutMethod: string | undefined
): payoutMethod is PayoutMethod {
  return Boolean(payoutMethod && DOMICILIARY_PAYOUT_METHODS.has(payoutMethod as PayoutMethod));
}

export function payoutMethodRequiresPickupLocation(
  payoutMethod: string | undefined
): payoutMethod is PayoutMethod {
  return Boolean(payoutMethod && PICKUP_PAYOUT_METHODS.has(payoutMethod as PayoutMethod));
}

export function payoutMethodHasCashPortion(payoutMethod: string | undefined): boolean {
  return Boolean(
    payoutMethod && CASH_PORTION_PAYOUT_METHODS.has(payoutMethod as PayoutMethod)
  );
}
