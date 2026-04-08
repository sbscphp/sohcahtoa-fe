import type {
  TransactionDetailComment,
  TransactionDetailData,
  TransactionDetailRequiredDoc,
  TransactionDetailStep,
} from "@/app/_lib/api/types";
import type { RequiredDocumentsData, TransactionDetailsData } from "@/app/(customer)/_components/transactions/details";
import type { TransactionDocumentItem } from "@/app/(customer)/_components/transactions/TransactionRequestSheet/DocumentDetail";
import type { TransactionDetailPayload } from "@/app/(customer)/(CustomerLayout)/transactions/detail/[id]/page";
import { getTransactionTypeLabel } from "@/app/(customer)/_lib/mock-transactions";
import { getDetailViewStatus } from "@/app/(customer)/_lib/transaction-details";
import { formatShortDate, formatShortTime } from "@/app/utils/helper/formatLocalDate";

function findDocByType(requiredDocuments: TransactionDetailRequiredDoc[], type: string) {
  return requiredDocuments.find((d) => d.type === type)?.uploaded ?? null;
}

function getStepData(api: TransactionDetailData): TransactionDetailStep["data"] | null {
  const completed = api.steps?.filter((s) => s.data && Object.keys(s.data).length > 0);
  const last = completed?.length ? completed[completed.length - 1] : null;
  return last?.data ?? null;
}

function getDocumentDisplayName(type: string): string {
  switch (type) {
    case "FORM_A_DOCUMENT":
      return "Form A";
    case "PASSPORT":
      return "International Passport";
    case "VISA":
      return "Valid Visa";
    case "RETURN_TICKET":
      return "Return Ticket";
    case "UTILITY_BILL":
      return "Utility Bill";
    case "WORK_PERMIT":
      return "Work Permit";
    default:
      return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
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
    bvn: stepData?.bvn ?? "",
    formAId: stepData?.formAId ?? "",
  };
  if (stepData?.nin != null) requiredDocuments.nin = stepData.nin;
  if (stepData?.tin != null) requiredDocuments.tin = stepData.tin;
  const formA = findDocByType(docs, "FORM_A_DOCUMENT");
  if (formA) requiredDocuments.formA = { filename: formA.fileName, url: formA.fileUrl };
  const visa = findDocByType(docs, "VISA");
  if (visa) requiredDocuments.visa = { filename: visa.fileName, url: visa.fileUrl };
  const returnTicket = findDocByType(docs, "RETURN_TICKET");
  if (returnTicket) requiredDocuments.returnTicket = { filename: returnTicket.fileName, url: returnTicket.fileUrl };
  const utilityBill = findDocByType(docs, "UTILITY_BILL");
  if (utilityBill) requiredDocuments.utilityBill = { filename: utilityBill.fileName, url: utilityBill.fileUrl };

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

  if (viewStatus === "awaiting_disbursement" || viewStatus === "transaction_settled") {
    payload.paymentDetails = {
      transactionId: api.referenceNumber ?? api.transactionId,
      transactionDate: formatShortDate(api.updatedAt),
      transactionTime: formatShortTime(api.updatedAt),
      transactionReceipt: { filename: "payment-receipt.pdf" },
      paidTo: "SohCahToa BSC\nAccess Bank\n0069000592",
    };
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
