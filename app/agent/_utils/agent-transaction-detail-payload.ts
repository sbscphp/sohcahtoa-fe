import type { AgentTransactionDetailData } from "@/app/_lib/api/types";
import type {
  PaymentDetailsData,
  RequiredDocumentsData,
  TransactionDetailsData,
  TransactionSettlementData,
} from "@/app/(customer)/_components/transactions/details";
import { formatShortDate } from "@/app/utils/helper/formatLocalDate";

export interface AgentTransactionDetailPayload {
  id: string;
  date: string;
  type: string;
  transactionTypeLabel: string;
  stage: string;
  status: string;
  currencyCode: string;
  identification: {
    fullName: string;
    phoneNumber: string;
    emailAddress: string;
    address: string;
  };
  transactionDetails: TransactionDetailsData;
  requiredDocuments: RequiredDocumentsData;
  /** Present when API exposes payment details (e.g. post-approval). */
  paymentDetails?: PaymentDetailsData;
  /** Present when API exposes settlement (e.g. transaction settled). */
  settlement?: TransactionSettlementData;
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatAmount(value: number | null, locale = "en-NG") {
  if (value == null) return "—";
  return value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function buildAgentDetailPayloadFromApi(api: AgentTransactionDetailData): AgentTransactionDetailPayload {
  const tx = api.transaction_details;
  const identity = api.identification;
  const required = api.required_documents;

  const amount = toNumberOrNull(tx.amount);
  const equivalent = toNumberOrNull(tx.equivalent_amount);

  const transactionDetails: TransactionDetailsData = {
    transactionId: tx.transaction_id,
    amount: { code: tx.currency ?? "USD", formatted: formatAmount(amount, "en-US") },
    equivalentAmount: { code: "NGN", formatted: formatAmount(equivalent, "en-NG") },
    dateInitiated: formatShortDate(tx.date_initiated),
    pickupAddress: "—",
  };

  const requiredDocuments: RequiredDocumentsData = {
    bvn: required.bvn ?? "N/A",
    formAId: required.form_a_id ?? "N/A",
  };
  if (required.nin != null) requiredDocuments.nin = required.nin;

  return {
    id: tx.transaction_id,
    date: api.timestamp,
    type: "—",
    transactionTypeLabel: "Transaction",
    stage: "—",
    status: "—",
    currencyCode: tx.currency ?? "USD",
    identification: {
      fullName: identity.full_name ?? "—",
      phoneNumber: identity.phone_number ?? "—",
      emailAddress: identity.email_address ?? "—",
      address: identity.address ?? "—",
    },
    transactionDetails,
    requiredDocuments,
  };
}

