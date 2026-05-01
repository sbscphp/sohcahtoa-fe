import type { TransactionDepositStatusData } from "@/app/_lib/api/types";

/** Customer deposit-status polling (Proceed to payment). */
export function isDepositVerified(data: TransactionDepositStatusData | undefined): boolean {
  if (!data) return false;
  if (data.depositConfirmed) return true;
  return data.hasDeposit === true && data.depositStatus === "VERIFIED";
}
