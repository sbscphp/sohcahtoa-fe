import type { AgentPaymentMovementItem } from "@/app/_lib/api/types";

/**
 * Client-side filter on the current page (API has no search param yet).
 * Pure — easy to unit test.
 */
export function filterMovementRowsByQuery(
  rows: AgentPaymentMovementItem[],
  query: string
): AgentPaymentMovementItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;

  return rows.filter((row) => {
    const hay = [
      row.transaction_id,
      row.customer_full_name,
      row.sender_full_name,
      row.admin_full_name,
      row.transaction_type,
      row.currency_pair,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}
