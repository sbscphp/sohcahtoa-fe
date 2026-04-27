import type {
  TransactionDetailComment,
  TransactionDetailData,
  TransactionDetailPaymentEntry,
  TransactionDetailRequiredDoc,
  TransactionDetailStep,
} from "@/app/_lib/api/types";
import type { PaymentDetailsData } from "@/app/(customer)/_components/transactions/details/PaymentDetailsSection";
import type { RequiredDocumentsData, TransactionDetailsData } from "@/app/(customer)/_components/transactions/details";
import type { TransactionDocumentItem } from "@/app/(customer)/_components/transactions/TransactionRequestSheet/DocumentDetail";
import type { TransactionDetailPayload } from "@/app/(customer)/(CustomerLayout)/transactions/detail/[id]/page";
import { getTransactionTypeLabel } from "@/app/(customer)/_lib/mock-transactions";
import { getDetailViewStatus } from "@/app/(customer)/_lib/transaction-details";
import { formatShortDate, formatShortTime } from "@/app/utils/helper/formatLocalDate";
import { getDocumentLabelForApiType } from "@/app/(customer)/_utils/transaction-validation";

function getStepData(api: TransactionDetailData): TransactionDetailStep["data"] | null {
  const completed = api.steps?.filter((s) => s.data && Object.keys(s.data).length > 0);
  const last = completed?.length ? completed[completed.length - 1] : null;
  return last?.data ?? null;
}

function getDocumentDisplayName(type: string): string {
  return getDocumentLabelForApiType(type);
}

function formatStatusLabel(status?: string | null): string {
  if (!status) return "Pending";
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function commentActionToDocumentStatus(action?: string | null): string | null {
  if (!action) return null;
  const normalized = action.toUpperCase();
  if (normalized.includes("MORE_INFO")) return "Request More Info";
  if (normalized.includes("RESUBMIT")) return "Resubmit Document";
  if (normalized.includes("REJECT")) return "Rejected";
  return null;
}

function buildDocStatusOverrideMap(comments: TransactionDetailComment[] = []): Map<string, string> {
  const byDocType = new Map<string, { createdAt: number; status: string }>();
  comments.forEach((comment) => {
    const docType = comment.metadata?.documentType;
    if (!docType) return;
    const mappedStatus = commentActionToDocumentStatus(comment.action);
    if (!mappedStatus) return;
    const createdAtTs = Date.parse(comment.createdAt);
    const prev = byDocType.get(docType);
    if (!prev || createdAtTs >= prev.createdAt) {
      byDocType.set(docType, { createdAt: createdAtTs, status: mappedStatus });
    }
  });

  const finalMap = new Map<string, string>();
  byDocType.forEach((value, key) => finalMap.set(key, value.status));
  return finalMap;
}

function mapPaymentDetailsFromApi(entries: TransactionDetailPaymentEntry[]): PaymentDetailsData {
  return {
    inflows: entries.map((entry) => ({
      id: entry.id,
      amount: entry.amount,
      currency: entry.currency,
      settledAmount: entry.settledAmount ?? undefined,
      feeAmount: entry.feeAmount ?? undefined,
      sourceAccountNumber: entry.sourceAccountNumber ?? undefined,
      sourceAccountName: entry.sourceAccountName ?? undefined,
      sourceBankName: entry.sourceBankName ?? undefined,
      tranRemarks: entry.tranRemarks ?? undefined,
      tranDateTime: entry.tranDateTime,
      status: entry.status,
      verifiedAt: entry.verifiedAt ?? undefined,
    })),
  };
}

function mapRequiredDocsToDocumentItems(
  requiredDocuments: TransactionDetailRequiredDoc[],
  comments: TransactionDetailComment[] = []
): TransactionDocumentItem[] {
  const statusOverrides = buildDocStatusOverrideMap(comments);
  return requiredDocuments.map((doc) => {
    const uploaded = doc.uploaded;

    const lastUploadDate = uploaded?.uploadedAt ? formatShortDate(uploaded.uploadedAt) : undefined;
    const lastUploadTime = uploaded?.uploadedAt ? formatShortTime(uploaded.uploadedAt) : undefined;

    return {
      id: doc.type,
      name: getDocumentDisplayName(doc.type),
      size: "—",
      status: statusOverrides.get(doc.type) ?? formatStatusLabel(uploaded?.status),
      lastUploadDate,
      lastUploadTime,
      fileName: uploaded?.fileName,
      url: uploaded?.fileUrl,
    };
  });
}

export function buildDetailPayloadFromApi(api: TransactionDetailData): TransactionDetailPayload {
  const stepData = getStepData(api);
  const docs = api.requiredDocuments ?? [];
  const pickup = api.cashPickup;
  const viewStatus = getDetailViewStatus(api.currentStep, api.status);

  const requiredDocuments: RequiredDocumentsData = {
    bvn: stepData?.bvn ?? api.personalInfo?.bvn ?? "",
    formAId: stepData?.formAId ?? api.formAId ?? "",
    uploadedFiles: docs
      .filter((d) => d.uploaded != null)
      .map((d) => ({
        documentType: d.type,
        filename: d.uploaded!.fileName,
        url: d.uploaded!.fileUrl,
      })),
  };
  const ninFromStep = stepData?.nin;
  const ninFromProfile = api.personalInfo?.nin;
  if (ninFromStep != null || ninFromProfile != null) {
    requiredDocuments.nin = ninFromStep ?? ninFromProfile ?? undefined;
  }
  if (stepData?.tin != null) requiredDocuments.tin = stepData.tin;

  const nairaFormatted = api.nairaEquivalent != null ? Number(api.nairaEquivalent).toLocaleString("en-NG", { minimumFractionDigits: 2 }) : "—";
  const foreignFormatted = api.foreignAmount != null ? Number(api.foreignAmount).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "—";

  const transactionDetails: TransactionDetailsData = {
    transactionId: api.referenceNumber ?? api.transactionId,
    amount: { code: "NGN", formatted: nairaFormatted },
    equivalentAmount: { code: api.currency, formatted: foreignFormatted },
    dateInitiated: formatShortDate(api.createdAt),
    pickupAddress: pickup?.pickupLocation ?? stepData?.pickupLocation?.address ?? stepData?.pickupLocation?.name ?? "—",
  };

  const payload: TransactionDetailPayload = {
    id: api.transactionId,
    date: api.createdAt,
    type: api.type,
    transactionTypeLabel: getTransactionTypeLabel(api.type),
    stage: api.currentStep,
    status: api.status,
    currencyCode: api.currency,
    transactionDetails,
    requiredDocuments,
    documentsForSheet: mapRequiredDocsToDocumentItems(docs, api.comments ?? []),
  };

  const apiPaymentRows = Array.isArray(api.paymentDetails) ? api.paymentDetails : [];
  const hasApiPaymentRows = apiPaymentRows.length > 0;

  if (hasApiPaymentRows) {
    payload.paymentDetails = mapPaymentDetailsFromApi(apiPaymentRows);
  }

  if (viewStatus === "transaction_settled") {
    payload.settlement = {
      settlementId: pickup?.pickupCode ?? "—",
      settlementDate: pickup?.pickedUpAt ? formatShortDate(pickup.pickedUpAt) : formatShortDate(api.updatedAt),
      settlementTime: pickup?.pickedUpAt ? formatShortTime(pickup.pickedUpAt) : formatShortTime(api.updatedAt),
      settlementReceipt: { filename: "settlement-receipt.pdf" },
      settlementStructureCash: "—",
      settlementStructurePrepaidCard: "—",
      paidInto: "—",
      settlementStatus: pickup?.status ?? "—",
    };
  }

  return payload;
}
