import type {
  AgentDashboardCashStatsPeriod,
  AgentPaymentMovementItem,
  AgentPaymentMovementType,
} from "@/app/_lib/api/types";
import { formatShortDate, formatShortTime } from "@/app/utils/helper/formatLocalDate";

/** UI Select values → API `period` for cash-stats */
const DATE_RANGE_LABEL_TO_PERIOD: Record<string, AgentDashboardCashStatsPeriod> = {
  "last 7 days": "last_month",
  "last 30 days": "last_month",
  "last 3 months": "last_3_months",
  "last 6 months": "last_6_months",
  "last year": "last_year",
};

export function dateRangeLabelToCashStatsPeriod(
  label: string
): AgentDashboardCashStatsPeriod {
  return DATE_RANGE_LABEL_TO_PERIOD[label] ?? "last_3_months";
}

export function formatNgnAmount(
  value: number | null | undefined,
  currencyCode = "NGN"
): string {
  if (value == null || Number.isNaN(Number(value))) return "—";
  const n = Number(value);
  const formatted = n.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currencyCode === "NGN" ? `₦${formatted}` : `${currencyCode} ${formatted}`;
}

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
    return formatNgnAmount(row.amount_disbursed, currency);
  }
  const v = row.amount_received ?? row.amount_disbursed;
  return formatNgnAmount(v, currency);
}
