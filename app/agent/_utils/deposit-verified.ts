import type { TransactionDepositStatusData } from "@/app/_lib/api/types";

/** Agent deposit-status polling (Proceed to payment, bank). */
export function isDepositVerified(data: TransactionDepositStatusData | undefined): boolean {
  if (!data) return false;
  if (data.depositConfirmed) return true;
  return data.hasDeposit === true && data.depositStatus === "VERIFIED";
}
