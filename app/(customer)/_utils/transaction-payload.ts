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
    fileSize: typeof doc.fileSize === "number" ? doc.fileSize : Number.parseInt(String(doc.fileSize ?? "0"), 10),
  }));
}

/** Maps international bank-details step into API `beneficiaryDetails`. */
export function beneficiaryDetailsFromBankForm(
  bank: Record<string, unknown> | null | undefined
): Record<string, unknown> | undefined {
  if (!bank) return undefined;
  const displayName = (bank.beneficiaryName ?? bank.accountName) as string | undefined;
  const region = bank.beneficiaryCountryRegion;
  const otherInformation =
    typeof bank.otherInformation === "string" ? bank.otherInformation.trim() : "";

  const details: Record<string, unknown> = {
    name: displayName,
    beneficiaryName: bank.beneficiaryName ?? bank.accountName,
    beneficiaryAddress: bank.beneficiaryAddress,
    beneficiaryCountryRegion: bank.beneficiaryCountryRegion,
    bankName: bank.bankName,
    bankAddress: bank.bankAddress,
    accountNumber: bank.accountNumber,
    accountName: bank.accountName ?? bank.beneficiaryName,
    swiftCode: bank.swiftCode,
    paymentReference: bank.paymentReference,
    iban: bank.iban,
    routingNumber: bank.routingNumber,
    ifscNumber: bank.ifscNumber,
    purposeCode: bank.purposeCode,
    bsbCode: bank.bsbCode,
  };

  if (region === "OTHER") {
    details.otherInformation = otherInformation;
  }

  return details;
}

type TransactionAmountSide = "send" | "receive";

function normalizeCurrency(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toUpperCase();
}

function inferPrimaryAmountSide(data: Record<string, unknown> | null): TransactionAmountSide {
  if (!data) return "receive";

  const sendCurrency = normalizeCurrency(data.sendCurrency);
  const receiveCurrency = normalizeCurrency(data.receiveCurrency);

  // Buy flows are typically NGN -> FX, sell flows are FX -> NGN.
  if (sendCurrency === "NGN" && receiveCurrency && receiveCurrency !== "NGN") {
    return "receive";
  }
  if (receiveCurrency === "NGN" && sendCurrency && sendCurrency !== "NGN") {
    return "send";
  }

  const hasReceiveAmount = data.receiveAmount != null && String(data.receiveAmount).trim() !== "";
  const hasSendAmount = data.sendAmount != null && String(data.sendAmount).trim() !== "";
  if (hasReceiveAmount) return "receive";
  if (hasSendAmount) return "send";
  return "receive";
}

function getAmount(data: Record<string, unknown> | null): number {
  if (!data) return 0;
  const side = inferPrimaryAmountSide(data);
  const raw = side === "send" ? data.sendAmount : data.receiveAmount;
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") return Number.parseFloat(raw) || 0;
  return 0;
}

function getCurrency(data: Record<string, unknown> | null): string {
  if (!data) return "USD";
  const side = inferPrimaryAmountSide(data);
  const raw = side === "send" ? data.sendCurrency : data.receiveCurrency;
  return typeof raw === "string" && raw.trim() ? raw : "USD";
}

function payoutFieldsFromSelection(
  data: Record<string, unknown> | null | undefined,
  amount: Record<string, unknown> | null
) {
  const payoutMethod =
    typeof data?.payoutMethod === "string" && data.payoutMethod.trim()
      ? data.payoutMethod
      : undefined;

  if (!payoutMethod) return {};

  const transactionAmount = getAmount(amount);
  const payoutBreakdown: Record<string, unknown> = { method: payoutMethod };

  if (payoutMethod === "electronic_transfer_100") {
    payoutBreakdown.electronicTransferPercentage = 100;
  } else if (payoutMethod === "card_100") {
    payoutBreakdown.cardPercentage = 100;
  } else if (payoutMethod === "card_75_cash_25") {
    payoutBreakdown.cardPercentage = 75;
    payoutBreakdown.cashPercentage = 25;
    payoutBreakdown.cashAmount = transactionAmount * 0.25;
  }

  return {
    payoutMethod,
    payoutBreakdown,
  };
}

function beneficiaryDetailsFromPayoutSelection(
  data: Record<string, unknown> | null | undefined
): Record<string, unknown> | undefined {
  if (data?.payoutMethod !== "electronic_transfer_100") return undefined;
  const bankAccount = data.bankAccount as Record<string, unknown> | undefined;
  if (!bankAccount) return undefined;

  return {
    bankName: bankAccount.bankName,
    accountNumber: bankAccount.accountNumber,
    accountName: bankAccount.accountName,
  };
}

/** Set by the buy vs sell route / agent flow — not inferred from currency fields. */
export type TransactionPayloadMode = "BUY" | "SELL";

function buildPickupLocation(data: Record<string, unknown> | null): PickupLocation | undefined {
  if (!data || typeof data.locationId !== "string" || !data.locationId.trim()) {
    return undefined;
  }
  return {
    id: data.locationId,
    name: (data as { name?: string }).name ?? "",
    address: (data as { address?: string }).address ?? "",
    recipientName: (data as { recipientName?: string }).recipientName ?? "",
    recipientPhone: (data as { recipientPhone?: string }).recipientPhone ?? "",
    state: (data as { state?: string }).state,
    city: (data as { city?: string }).city,
    pickupDate: (data as { pickupDate?: string }).pickupDate,
    pickupTime: (data as { pickupTime?: string }).pickupTime,
  };
}

function buildPTAPayload(
  bag: TransactionFormDataBag,
  documents: TransactionDocument[]
): CreateTransactionRequest {
  const upload = bag.uploadDocumentsData as Record<string, unknown> | null;
  const amount = bag.transactionAmountData;
  const pickup = bag.pickupPointData;
  const payout = payoutFieldsFromSelection(pickup, amount);

  return {
    type: "PTA",
    currency: getCurrency(amount),
    amount: getAmount(amount),
    purpose: "Personal travel",
    destinationCountry: "United States",
    bvn: typeof upload?.bvn === "string" ? upload.bvn : undefined,
    nin: typeof upload?.ninNumber === "string" ? upload.ninNumber : undefined,
    formAId: typeof upload?.formAId === "string" ? upload.formAId : undefined,
    passportDocumentNumber:
      typeof upload?.passportDocumentNumber === "string" ? upload.passportDocumentNumber : undefined,
    passportIssueDate:
      typeof upload?.passportIssueDate === "string" ? upload.passportIssueDate : undefined,
    passportExpiryDate:
      typeof upload?.passportExpiryDate === "string" ? upload.passportExpiryDate : undefined,
    documents,
    ...payout,
    beneficiaryDetails: beneficiaryDetailsFromPayoutSelection(pickup),
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
  const payout = payoutFieldsFromSelection(pickup, amount);

  return {
    type: "BTA",
    currency: getCurrency(amount),
    amount: getAmount(amount),
    purpose: "Business travel",
    destinationCountry: "United States",
    bvn: typeof upload?.bvn === "string" ? upload.bvn : undefined,
    formAId: typeof upload?.formAId === "string" ? upload.formAId : undefined,
    passportDocumentNumber:
      typeof upload?.passportDocumentNumber === "string" ? upload.passportDocumentNumber : undefined,
    passportIssueDate:
      typeof upload?.passportIssueDate === "string" ? upload.passportIssueDate : undefined,
    passportExpiryDate:
      typeof upload?.passportExpiryDate === "string" ? upload.passportExpiryDate : undefined,
    documents,
    ...payout,
    beneficiaryDetails: beneficiaryDetailsFromPayoutSelection(pickup),
    pickupLocation: buildPickupLocation(pickup ?? null),
  };
}

function buildTouristPayload(
  bag: TransactionFormDataBag,
  documents: TransactionDocument[]
): CreateTransactionRequest {
  const upload = bag.uploadDocumentsData as Record<string, string | any> | null;
  const amount = bag.transactionAmountData;
  const pickup = bag.pickupPointData;
  const payout = payoutFieldsFromSelection(pickup, amount);

  return {
    type: "TOURIST_FX",
    currency: getCurrency(amount),
    amount: getAmount(amount),
    purpose: "Tourist travel",
    destinationCountry: "United States",
    bvn: upload?.bvn ?? undefined,
    nin: upload?.ninNumber ?? undefined,
    formAId: upload?.formAId ?? undefined,
    passportDocumentNumber: upload?.passportDocumentNumber ?? undefined,
    passportIssueDate: upload?.passportIssueDate ?? undefined,
    passportExpiryDate: upload?.passportExpiryDate ?? undefined,
    returnTicketDocumentNumber: upload?.returnTicketDocumentNumber ?? undefined,
    documents,
    ...payout,
    beneficiaryDetails: beneficiaryDetailsFromPayoutSelection(pickup),
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
    passportDocumentNumber:
      typeof upload?.passportDocumentNumber === "string" ? upload.passportDocumentNumber : undefined,
    passportIssueDate:
      typeof upload?.passportIssueDate === "string" ? upload.passportIssueDate : undefined,
    passportExpiryDate:
      typeof upload?.passportExpiryDate === "string" ? upload.passportExpiryDate : undefined,
    beneficiaryDetails: beneficiaryDetailsFromBankForm(bank),
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
    passportDocumentNumber:
      typeof upload?.passportDocumentNumber === "string" ? upload.passportDocumentNumber : undefined,
    passportIssueDate:
      typeof upload?.passportIssueDate === "string" ? upload.passportIssueDate : undefined,
    passportExpiryDate:
      typeof upload?.passportExpiryDate === "string" ? upload.passportExpiryDate : undefined,
    beneficiaryDetails: beneficiaryDetailsFromBankForm(bank),
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
    passportDocumentNumber:
      typeof upload?.passportDocumentNumber === "string" ? upload.passportDocumentNumber : undefined,
    passportIssueDate:
      typeof upload?.passportIssueDate === "string" ? upload.passportIssueDate : undefined,
    passportExpiryDate:
      typeof upload?.passportExpiryDate === "string" ? upload.passportExpiryDate : undefined,
    beneficiaryDetails: beneficiaryDetailsFromBankForm(bank),
    documents,
  };
}

function buildResidentFxPayload(
  bag: TransactionFormDataBag,
  documents: TransactionDocument[]
): CreateTransactionRequest {
  const upload = bag.uploadDocumentsData as Record<string, string | any> | null;
  const amount = bag.transactionAmountData;
  const pickup = bag.pickupPointData;

  return {
    type: "RESIDENT_FX",
    currency: getCurrency(amount),
    amount: getAmount(amount),
    purpose: "Transaction",
    destinationCountry: "United States",
    bvn: upload?.bvn ?? undefined,
    nin: upload?.ninNumber ?? undefined,
    tinNumber: upload?.tinNumber ?? undefined,
    passportDocumentNumber: upload?.passportDocumentNumber ?? undefined,
    passportIssueDate:
      typeof upload?.passportIssueDate === "string" ? upload.passportIssueDate : undefined,
    passportExpiryDate:
      typeof upload?.passportExpiryDate === "string" ? upload.passportExpiryDate : undefined,
    documents,
    pickupLocation: buildPickupLocation(pickup ?? null),
  };
}

function buildExpatriateFxPayload(
  bag: TransactionFormDataBag,
  documents: TransactionDocument[]
): CreateTransactionRequest {
  const upload = bag.uploadDocumentsData as Record<string, string | any> | null;
  const amount = bag.transactionAmountData;
  const pickup = bag.pickupPointData;

  return {
    type: "EXPATRIATE_FX",
    currency: getCurrency(amount),
    amount: getAmount(amount),
    purpose: "Transaction",
    destinationCountry: "United States",
    bvn: upload?.bvn ?? undefined,
    nin: upload?.ninNumber ?? undefined,
    passportDocumentNumber: upload?.passportDocumentNumber ?? undefined,
    workPermitNumber: upload?.workPermitNumber ?? undefined,
    passportIssueDate: upload?.passportIssueDate ?? undefined,
    passportExpiryDate: upload?.passportExpiryDate ?? undefined,
    utilityBillNumber: upload?.utilityBillNumber ?? undefined,
    documents,
    pickupLocation: buildPickupLocation(pickup ?? null),
  };
}

/**
 * Builds the API payload for the given transaction type from collected form data and uploaded documents.
 * Pure function: no side effects, easily testable.
 *
 * @param mode - Pass `"BUY"` from buy FX routes or `"SELL"` from sell FX routes (agent mirrors customer).
 */
export function buildTransactionPayload(
  transactionType: TransactionType,
  bag: TransactionFormDataBag,
  documents: TransactionDocument[],
  mode: TransactionPayloadMode
): CreateTransactionRequest {
  const amount = bag.transactionAmountData;
  let payload: CreateTransactionRequest;
  switch (transactionType) {
    case "PTA":
      payload = buildPTAPayload(bag, documents);
      break;
    case "BTA":
      payload = buildBTAPayload(bag, documents);
      break;
    case "TOURIST_FX":
      payload = buildTouristPayload(bag, documents);
      break;
    case "SCHOOL_FEES":
      payload = buildSchoolFeesPayload(bag, documents);
      break;
    case "MEDICAL":
      payload = buildMedicalPayload(bag, documents);
      break;
    case "PROFESSIONAL_BODY":
      payload = buildProfessionalBodyPayload(bag, documents);
      break;
    case "RESIDENT_FX":
      payload = buildResidentFxPayload(bag, documents);
      break;
    case "EXPATRIATE_FX":
      payload = buildExpatriateFxPayload(bag, documents);
      break;
    default: {
      const bank = bag.bankDetailsData as Record<string, unknown> | null;
      const pickup = bag.pickupPointData;

      payload = {
        type: transactionType as TransactionTypeAPI,
        currency: getCurrency(amount),
        amount: getAmount(amount),
        purpose: "Transaction",
        destinationCountry: "United States",
        documents,
        beneficiaryDetails: bank ?? undefined,
        pickupLocation: buildPickupLocation(pickup ?? null),
      };
    }
  }
  return { ...payload, mode };
}
