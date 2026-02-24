import type {
  CreateTransactionRequest,
  TransactionDocument,
  TransactionTypeAPI,
  PickupLocation,
} from "@/app/_lib/api/types";
import type { TransactionType } from "./transaction-document-requirements";

export interface TransactionFormDataBag {
  uploadDocumentsData: Record<string, unknown> | null;
  transactionAmountData: Record<string, unknown> | null;
  pickupPointData?: Record<string, unknown> | null;
  bankDetailsData?: Record<string, unknown> | null;
}

export interface UploadedDocumentLike {
  documentType: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number | string;
}

export function toTransactionDocuments(uploaded: UploadedDocumentLike[]): TransactionDocument[] {
  return uploaded.map((doc) => ({
    documentType: doc.documentType,
    fileUrl: doc.fileUrl,
    fileName: doc.fileName,
    fileSize: typeof doc.fileSize === "number" ? doc.fileSize : parseInt(String(doc.fileSize ?? 0), 10),
  }));
}

function getAmount(data: Record<string, unknown> | null): number {
  if (!data) return 0;
  const raw = data.receiveAmount ?? data.sendAmount;
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") return parseFloat(raw) || 0;
  return 0;
}

function getCurrency(data: Record<string, unknown> | null): string {
  if (!data) return "USD";
  const raw = data.receiveCurrency ?? data.sendCurrency;
  return typeof raw === "string" ? raw : "USD";
}

function buildPickupLocation(data: Record<string, unknown> | null): PickupLocation | undefined {
  if (!data || typeof data.locationId !== "string") return undefined;
  return {
    id: data.locationId,
    name: (data as { name?: string }).name ?? "",
    address: (data as { address?: string }).address ?? "",
    recipientName: (data as { recipientName?: string }).recipientName ?? "",
    recipientPhone: (data as { recipientPhone?: string }).recipientPhone ?? "",
  };
}

function buildPTAPayload(
  bag: TransactionFormDataBag,
  documents: TransactionDocument[]
): CreateTransactionRequest {
  const upload = bag.uploadDocumentsData as Record<string, unknown> | null;
  const amount = bag.transactionAmountData;
  const pickup = bag.pickupPointData;

  return {
    type: "PTA",
    currency: getCurrency(amount),
    amount: getAmount(amount),
    purpose: "Personal travel",
    destinationCountry: "United States",
    bvn: typeof upload?.bvn === "string" ? upload.bvn : undefined,
    nin: typeof upload?.ninNumber === "string" ? upload.ninNumber : undefined,
    formAId: typeof upload?.formAId === "string" ? upload.formAId : undefined,
    documents,
    pickupLocation: buildPickupLocation(pickup ?? null),
  };
}

function buildBTAPayload(
  bag: TransactionFormDataBag,
  documents: TransactionDocument[]
): CreateTransactionRequest {
  const upload = bag.uploadDocumentsData as Record<string, unknown> | null;
  const amount = bag.transactionAmountData;
  const pickup = bag.pickupPointData;

  return {
    type: "BTA",
    currency: getCurrency(amount),
    amount: getAmount(amount),
    purpose: "Business travel",
    destinationCountry: "United States",
    bvn: typeof upload?.bvn === "string" ? upload.bvn : undefined,
    formAId: typeof upload?.formAId === "string" ? upload.formAId : undefined,
    documents,
    pickupLocation: buildPickupLocation(pickup ?? null),
  };
}

function buildTouristPayload(
  bag: TransactionFormDataBag,
  documents: TransactionDocument[]
): CreateTransactionRequest {
  const upload = bag.uploadDocumentsData as Record<string, unknown> | null;
  const amount = bag.transactionAmountData;
  const pickup = bag.pickupPointData;

  return {
    type: "TOURIST_FX",
    currency: getCurrency(amount),
    amount: getAmount(amount),
    purpose: "Tourist travel",
    destinationCountry: "United States",
    bvn: typeof upload?.bvn === "string" ? upload.bvn : undefined,
    nin: typeof upload?.ninNumber === "string" ? upload.ninNumber : undefined,
    formAId: typeof upload?.formAId === "string" ? upload.formAId : undefined,
    documents,
    pickupLocation: buildPickupLocation(pickup ?? null),
  };
}

function buildSchoolFeesPayload(
  bag: TransactionFormDataBag,
  documents: TransactionDocument[]
): CreateTransactionRequest {
  const upload = bag.uploadDocumentsData as Record<string, unknown> | null;
  const amount = bag.transactionAmountData;
  const bank = bag.bankDetailsData as Record<string, unknown> | null;

  return {
    type: "SCHOOL_FEES",
    currency: getCurrency(amount),
    amount: getAmount(amount),
    purpose: "School fees",
    destinationCountry: "United Kingdom",
    formAId: typeof upload?.formAId === "string" ? upload.formAId : undefined,
    admissionType: (upload?.admissionType as "UNDERGRADUATE" | "POSTGRADUATE" | "OTHER") ?? undefined,
    beneficiaryDetails: bank
      ? {
          name: bank.accountName,
          accountNumber: bank.accountNumber,
          accountName: bank.accountName,
          bankName: bank.bankName,
          iban: bank.iban,
        }
      : undefined,
    documents,
  };
}

function buildMedicalPayload(
  bag: TransactionFormDataBag,
  documents: TransactionDocument[]
): CreateTransactionRequest {
  const upload = bag.uploadDocumentsData as Record<string, unknown> | null;
  const amount = bag.transactionAmountData;
  const bank = bag.bankDetailsData as Record<string, unknown> | null;

  return {
    type: "MEDICAL",
    currency: getCurrency(amount),
    amount: getAmount(amount),
    purpose: "Medical",
    destinationCountry: "United Kingdom",
    bvn: typeof upload?.bvn === "string" ? upload.bvn : undefined,
    nin: typeof upload?.ninNumber === "string" ? upload.ninNumber : undefined,
    formAId: typeof upload?.formAId === "string" ? upload.formAId : undefined,
    beneficiaryDetails: bank
      ? {
          name: bank.accountName,
          accountNumber: bank.accountNumber,
          accountName: bank.accountName,
          bankName: bank.bankName,
          iban: bank.iban,
        }
      : undefined,
    documents,
  };
}

function buildProfessionalBodyPayload(
  bag: TransactionFormDataBag,
  documents: TransactionDocument[]
): CreateTransactionRequest {
  const upload = bag.uploadDocumentsData as Record<string, unknown> | null;
  const amount = bag.transactionAmountData;
  const bank = bag.bankDetailsData as Record<string, unknown> | null;

  return {
    type: "PROFESSIONAL_BODY",
    currency: getCurrency(amount),
    amount: getAmount(amount),
    purpose: "Professional body fees",
    destinationCountry: "United Kingdom",
    bvn: typeof upload?.bvn === "string" ? upload.bvn : undefined,
    formAId: typeof upload?.formAId === "string" ? upload.formAId : undefined,
    beneficiaryDetails: bank
      ? {
          name: bank.accountName,
          accountNumber: bank.accountNumber,
          accountName: bank.accountName,
          bankName: bank.bankName,
          iban: bank.iban,
        }
      : undefined,
    documents,
  };
}

/**
 * Builds the API payload for the given transaction type from collected form data and uploaded documents.
 * Pure function: no side effects, easily testable.
 */
export function buildTransactionPayload(
  transactionType: TransactionType,
  bag: TransactionFormDataBag,
  documents: TransactionDocument[]
): CreateTransactionRequest {
  switch (transactionType) {
    case "PTA":
      return buildPTAPayload(bag, documents);
    case "BTA":
      return buildBTAPayload(bag, documents);
    case "TOURIST_FX":
      return buildTouristPayload(bag, documents);
    case "SCHOOL_FEES":
      return buildSchoolFeesPayload(bag, documents);
    case "MEDICAL":
      return buildMedicalPayload(bag, documents);
    case "PROFESSIONAL_BODY":
      return buildProfessionalBodyPayload(bag, documents);
    default: {
      const amount = bag.transactionAmountData;
      return {
        type: transactionType as TransactionTypeAPI,
        currency: getCurrency(amount),
        amount: getAmount(amount),
        purpose: "Transaction",
        destinationCountry: "United States",
      };
    }
  }
}
