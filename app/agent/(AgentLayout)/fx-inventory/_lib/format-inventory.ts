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

/** Foreign / disbursed side of a pair such as `USD/NGN`. */
export function foreignCurrencyFromPair(pair: string | null | undefined): string {
  if (!pair?.trim()) return "NGN";
  const [foreign] = pair.split("/");
  return foreign?.trim().toUpperCase() || "NGN";
}

/** Local settlement side of a pair such as `USD/NGN`. */
export function localCurrencyFromPair(pair: string | null | undefined): string {
  if (!pair?.trim()) return "NGN";
  const parts = pair.split("/");
  return parts[1]?.trim().toUpperCase() || "NGN";
}

function readOptionalCurrency(
  row: AgentPaymentMovementItem,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim().toUpperCase();
    }
  }
  return undefined;
}

/**
 * Currency for a movement row.
 * Prefers explicit API fields when present; otherwise derives from `currency_pair`.
 */
export function movementRowCurrency(
  row: AgentPaymentMovementItem,
  tab: AgentPaymentMovementType,
): string {
  if (tab === "cash_disbursed") {
    return (
      readOptionalCurrency(row, [
        "amount_disbursed_currency",
        "disbursed_currency",
        "currency",
      ]) ?? foreignCurrencyFromPair(row.currency_pair)
    );
  }

  return (
    readOptionalCurrency(row, ["amount_received_currency", "currency"]) ??
    localCurrencyFromPair(row.currency_pair)
  );
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
  fallbackCurrency = "NGN",
): string {
  const currency = movementRowCurrency(row, tab) || fallbackCurrency;

  if (tab === "cash_disbursed") {
    return formatCurrencyAmount(row.amount_disbursed, currency);
  }
  const v = row.amount_received ?? row.amount_disbursed;
  return formatCurrencyAmount(v, currency);
}
