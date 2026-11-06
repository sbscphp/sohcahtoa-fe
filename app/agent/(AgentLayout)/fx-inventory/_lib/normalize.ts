import type { TransactionListItem } from "@/app/_lib/api/types";
import type {
  CashDisbursement,
  CashLodgement,
  DisbursementDisplayStatus,
  InventoryTransaction,
  LodgementDisplayStatus,
  TransactionSettlementStatus,
} from "./types";

/**
 * The agent fx-inventory GET endpoints don't document response bodies, so each field is read
 * from the likely names (camelCase and snake_case) and falls back to a safe default.
 */
type Rec = Record<string, unknown>;

const isRec = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);

export function pickString(r: Rec, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

export function pickNumber(r: Rec, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  }
  return undefined;
}

const LIST_KEYS = ["items", "data", "rows", "results", "lodgments", "disbursements", "balances"];

/** Accepts `[...]`, `{ items: [...] }`, `{ data: { items: [...] } }` and similar. */
export function unwrapList(data: unknown, depth = 0): Rec[] {
  if (Array.isArray(data)) return data.filter(isRec);
  if (isRec(data) && depth < 3) {
    for (const key of LIST_KEYS) {
      if (key in data) {
        const inner = unwrapList(data[key], depth + 1);
        if (inner.length || Array.isArray(data[key])) return inner;
      }
    }
  }
  return [];
}

function personName(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (!isRec(value)) return undefined;
  const full = pickString(value, ["fullName", "full_name", "name"]);
  if (full) return full;
  const joined = [pickString(value, ["firstName", "first_name"]), pickString(value, ["lastName", "last_name"])]
    .filter(Boolean)
    .join(" ");
  return joined || undefined;
}

export function normalizeBalances(data: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  for (const row of unwrapList(data)) {
    const currency = pickString(row, ["currency", "currencyCode", "currency_code"])?.toUpperCase();
    const balance = pickNumber(row, ["balance", "cashBalance", "cash_balance", "currentBalance", "availableBalance", "amount"]);
    if (currency && balance != null) out[currency] = balance;
  }
  return out;
}

const DISBURSEMENT_STATUS: Record<string, DisbursementDisplayStatus> = {
  PENDING_APPROVAL: "Pending",
  APPROVED: "Pending",
  COMPLETED: "Confirmed",
  REJECTED: "Rejected",
};

export function normalizeDisbursements(data: unknown): CashDisbursement[] {
  return unwrapList(data).map((r, i) => {
    const raw = (pickString(r, ["status"]) ?? "").toUpperCase();
    const role = pickString(r, ["disbursedByRole", "adminRole", "role"]);
    const name =
      personName(r.disbursedBy) ??
      personName(r.admin) ??
      personName(r.createdBy) ??
      pickString(r, ["disbursedByName", "disbursed_by_name", "adminName", "admin_name"]) ??
      "—";
    const id = pickString(r, ["id", "disbursementId", "disbursement_id"]) ?? `disbursement-${i}`;
    return {
      id,
      reference: pickString(r, ["reference", "referenceNumber", "reference_number", "ref"]) ?? id,
      currency: (pickString(r, ["currency", "currencyCode"]) ?? "").toUpperCase(),
      amount: pickNumber(r, ["amount", "disbursedAmount", "disbursed_amount"]) ?? null,
      purpose: pickString(r, ["purpose", "reason", "notes"]) ?? "—",
      disbursedBy: role && name !== "—" ? `${name} (${role})` : name,
      date: pickString(r, ["createdAt", "created_at", "disbursedAt", "date"]) ?? "",
      resolvedAt: pickString(r, ["completedAt", "completed_at", "confirmedAt", "resolvedAt", "rejectedAt"]) ?? null,
      status: DISBURSEMENT_STATUS[raw] ?? "Pending",
      awaitingConfirmation: raw === "APPROVED",
    };
  });
}

const LODGEMENT_STATUS: Record<string, LodgementDisplayStatus> = {
  PENDING_VERIFICATION: "Pending Verification",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
};

export function normalizeLodgements(data: unknown): CashLodgement[] {
  return unwrapList(data).map((r, i) => {
    const raw = (pickString(r, ["status"]) ?? "").toUpperCase();
    const declared = pickNumber(r, ["statedAmount", "stated_amount", "declaredAmount", "amount"]) ?? null;
    const received = pickNumber(r, ["confirmedAmount", "confirmed_amount", "amountReceived", "amount_received"]) ?? null;
    const variance =
      pickNumber(r, ["varianceAmount", "variance_amount", "variance"]) ??
      (declared != null && received != null ? received - declared : null);
    return {
      id: pickString(r, ["id", "lodgmentId"]) ?? `lodgment-${i}`,
      currency: (pickString(r, ["currency", "currencyCode"]) ?? "").toUpperCase(),
      declaredAmount: declared,
      amountReceived: received,
      variance,
      status: LODGEMENT_STATUS[raw] ?? "Pending Verification",
      submittedAt: pickString(r, ["createdAt", "created_at", "submittedAt", "date"]) ?? "",
    };
  });
}

const ACRONYMS = new Set(["PTA", "BTA", "FX", "IMTO"]);

/** "SCHOOL_FEES" -> "School fees", "PTA" stays "PTA"; FX the bureau acquires reads as "Sell FX". */
function transactionTypeLabel(type: string | undefined, group: string | undefined): string {
  if (group === "SELL") return "Sell FX";
  if (!type) return "—";
  return type
    .split("_")
    .map((w, i) => (ACRONYMS.has(w.toUpperCase()) ? w.toUpperCase() : i === 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()))
    .join(" ");
}

const DAY_MS = 24 * 60 * 60 * 1000;

function settlementStatus(raw: string, createdAt: string): TransactionSettlementStatus {
  const status = raw.toUpperCase();
  if (status === "COMPLETED") return "Settled";
  if (status === "REJECTED" || status === "CANCELLED") return "Rejected";
  const created = Date.parse(createdAt);
  return Number.isFinite(created) && Date.now() - created > DAY_MS ? "Overdue" : "Pending";
}

function toNumber(v: string | number | null | undefined): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function normalizeTransactions(items: TransactionListItem[]): InventoryTransaction[] {
  return items.map((t, i) => {
    const raw = t as unknown as Rec;
    const id = t.referenceNumber ?? t.reference_number ?? t.transactionId ?? t.id;
    const amount = toNumber(t.foreignAmount);
    // SELL group = bureau acquired FX from the customer (+); BUY / remittance = FX handed out (-).
    const fxAmount = amount == null ? null : t.group === "SELL" ? amount : -amount;
    const createdAt = t.createdAt ?? t.transaction_date ?? "";
    return {
      key: `${t.id}-${i}`,
      id,
      customerName:
        personName(raw.customer) ??
        pickString(raw, ["customerName", "customer_name", "customer_full_name", "customerFullName"]) ??
        "—",
      transactionType: transactionTypeLabel(t.type ?? t.transaction_type, t.group),
      currencyPair: `${t.currency}-NGN`,
      fxAmount,
      currency: t.currency,
      rate: toNumber(t.exchangeRate),
      ngnAmount: toNumber(t.nairaEquivalent),
      date: createdAt,
      status: settlementStatus(t.status ?? t.transaction_status ?? "", createdAt),
    };
  });
}
