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
import {
  normalizeTransactionStatus,
  transactionAllowsMissingDocumentUpload,
} from "@/app/(customer)/_lib/transaction-details";
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

function isRequiredDocEntry(doc: TransactionDetailRequiredDoc): boolean {
  return doc.required !== false;
}

/** Required docs always show; optional docs only when a file was uploaded. */
function shouldIncludeDocumentInDetailView(doc: TransactionDetailRequiredDoc): boolean {
  return isRequiredDocEntry(doc) || doc.uploaded != null;
}

function countByDocumentType(docs: TransactionDetailRequiredDoc[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const doc of docs) {
    totals.set(doc.type, (totals.get(doc.type) ?? 0) + 1);
  }
  return totals;
}

function documentDisplayLabel(
  type: string,
  occurrenceIndex: number,
  totalForType: number
): string {
  const base = getDocumentDisplayName(type);
  return totalForType > 1 ? `${base} ${occurrenceIndex}` : base;
}

function mapRequiredDocsToDocumentItems(
  requiredDocuments: TransactionDetailRequiredDoc[],
  comments: TransactionDetailComment[] = []
): TransactionDocumentItem[] {
  const statusOverrides = buildDocStatusOverrideMap(comments);
  const visibleDocs = requiredDocuments.filter(shouldIncludeDocumentInDetailView);
  const totalsByType = countByDocumentType(visibleDocs);
  const occurrenceByType = new Map<string, number>();

  return visibleDocs.map((doc, index) => {
    const uploaded = doc.uploaded;
    const overrideStatus = statusOverrides.get(doc.type);
    const occurrence = (occurrenceByType.get(doc.type) ?? 0) + 1;
    occurrenceByType.set(doc.type, occurrence);
    const totalForType = totalsByType.get(doc.type) ?? 1;
    const name = documentDisplayLabel(doc.type, occurrence, totalForType);

    if (!uploaded) {
      return {
        id: `missing-${doc.type}-${index}`,
        documentType: doc.type,
        name,
        size: "—",
        status: overrideStatus ?? "Not uploaded",
        needsUpload: true,
      };
    }

    const lastUploadDate = uploaded.uploadedAt
      ? formatShortDate(uploaded.uploadedAt)
      : undefined;
    const lastUploadTime = uploaded.uploadedAt
      ? formatShortTime(uploaded.uploadedAt)
      : undefined;

    return {
      id: uploaded.id || `${doc.type}-${index}`,
      documentType: doc.type,
      name,
      size: "—",
      status: overrideStatus ?? formatStatusLabel(uploaded.status),
      lastUploadDate,
      lastUploadTime,
      fileName: uploaded.fileName,
      url: uploaded.fileUrl,
      needsUpload: false,
    };
  });
}

export function buildDetailPayloadFromApi(api: TransactionDetailData): TransactionDetailPayload {
  const stepData = getStepData(api);
  const docs = api.requiredDocuments ?? [];
  const pickup = api.cashPickup;
  const requiredDocuments: RequiredDocumentsData = {
    bvn: stepData?.bvn ?? api.personalInfo?.bvn ?? "",
    nin: stepData?.nin ?? api.personalInfo?.nin ?? "",
    passportDocumentNumber: stepData?.passportDocumentNumber ?? api.personalInfo?.passportDocumentNumber ?? "",
    passportIssueDate: stepData?.passportIssueDate ?? api.personalInfo?.passportIssueDate ?? "",
    passportExpiryDate: stepData?.passportExpiryDate ?? api.personalInfo?.passportExpiryDate ?? "",
    tinNumber: stepData?.tinNumber ?? api.personalInfo?.tinNumber ?? "",
    studentName: stepData?.studentName ?? api.personalInfo?.studentName ?? "",
    studentNin: stepData?.studentNin ?? api.personalInfo?.studentNin ?? "",
    studentPassportDocumentNumber:
      stepData?.studentPassportDocumentNumber ??
      api.personalInfo?.studentPassportDocumentNumber ??
      "",
    studentPassportIssueDate:
      stepData?.studentPassportIssueDate ?? api.personalInfo?.studentPassportIssueDate ?? "",
    studentPassportExpiryDate:
      stepData?.studentPassportExpiryDate ?? api.personalInfo?.studentPassportExpiryDate ?? "",
    workPermitNumber: stepData?.workPermitNumber ?? api.personalInfo?.workPermitNumber ?? "",
    formAId: stepData?.formAId ?? api.formAId ?? "",
    uploadedFiles: (() => {
      const uploadedDocs = docs.filter((d) => d.uploaded != null);
      const totalsByType = countByDocumentType(uploadedDocs);
      const occurrenceByType = new Map<string, number>();

      return uploadedDocs.map((d, index) => {
        const uploaded = d.uploaded!;
        const occurrence = (occurrenceByType.get(d.type) ?? 0) + 1;
        occurrenceByType.set(d.type, occurrence);
        const totalForType = totalsByType.get(d.type) ?? 1;

        return {
          id: uploaded.id || `${d.type}-${index}`,
          documentType: d.type,
          label: documentDisplayLabel(d.type, occurrence, totalForType),
          filename: uploaded.fileName,
          url: uploaded.fileUrl,
        };
      });
    })(),
    missingDocumentTypes: docs
      .filter((d) => isRequiredDocEntry(d) && d.uploaded == null)
      .map((d, index) => ({
        id: `missing-${d.type}-${index}`,
        documentType: d.type,
        label: getDocumentDisplayName(d.type),
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
    allowMissingDocumentUpload: transactionAllowsMissingDocumentUpload(api.status),
  };

  const apiPaymentRows = Array.isArray(api.paymentDetails) ? api.paymentDetails : [];
  const hasApiPaymentRows = apiPaymentRows.length > 0;

  if (hasApiPaymentRows) {
    payload.paymentDetails = mapPaymentDetailsFromApi(apiPaymentRows);
  }

  if (normalizeTransactionStatus(api.status) === "COMPLETED") {
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
