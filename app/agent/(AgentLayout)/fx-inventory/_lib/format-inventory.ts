import { formatCurrencyAmount } from "@/app/(customer)/_lib/currency";
import type {
  AgentPaymentMovementItem,
  AgentPaymentMovementType,
} from "@/app/_lib/api/types";
import { formatShortDate, formatShortTime } from "@/app/utils/helper/formatLocalDate";

export function formatTransactionTypeLabel(raw: string | null | undefined): string {
  if (!raw) return "—";
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatMovementDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return `${formatShortDate(iso)}, ${formatShortTime(iso)}`;
  } catch {
    return iso;
  }
}

export function movementReceivedFromLabel(
  row: AgentPaymentMovementItem,
  tab: AgentPaymentMovementType
): string {
  if (tab === "cash_received_from_admin") {
    return row.admin_full_name != null && String(row.admin_full_name).trim() !== ""
      ? String(row.admin_full_name)
      : "Admin";
  }
  return (
    row.customer_full_name?.trim() ||
    row.sender_full_name?.trim() ||
    "—"
  );
}

export function movementAmountDisplay(
  row: AgentPaymentMovementItem,
  tab: AgentPaymentMovementType,
  currency: string
): string {
  if (tab === "cash_disbursed") {
    return formatCurrencyAmount(row.amount_disbursed, currency);
  }
  const v = row.amount_received ?? row.amount_disbursed;
  return formatCurrencyAmount(v, currency);
}
