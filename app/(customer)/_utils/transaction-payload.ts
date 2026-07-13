import type {
  CreateTransactionRequest,
  DisbursementOption,
  TransactionDocument,
  TransactionTypeAPI,
  PickupLocation,
} from "@/app/_lib/api/types";
import type { TransactionType } from "./transaction-document-requirements";
import { mapUiAdmissionTypeToApi } from "./school-fees-admission";
import { getCustomerFxPurposeForPayload } from "@/app/(customer)/_lib/fx-transaction-purpose-payload";

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

function pickOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

/** Maps international bank-details step into API `beneficiaryDetails`. */
export function beneficiaryDetailsFromBankForm(
  bank: Record<string, unknown> | null | undefined
): Record<string, unknown> | undefined {
  if (!bank) return undefined;
  const organizationName = (
    (bank.organizationName as string | undefined) ??
    (bank.beneficiaryName as string | undefined) ??
    (bank.schoolName as string | undefined)
  )?.trim();
  const bankName = (
    (bank.bankName as string | undefined) ??
    (bank.bankAccountName as string | undefined)
  )?.trim();
  const accountName = (bank.accountName as string | undefined)?.trim();
  const region = bank.beneficiaryCountryRegion;
  const otherInformation =
    typeof bank.otherInformation === "string" ? bank.otherInformation.trim() : "";

  const details: Record<string, unknown> = {
    name: organizationName,
    organizationName,
    schoolName: organizationName,
    beneficiaryName: organizationName,
    beneficiaryPhone: bank.beneficiaryPhone,
    beneficiaryEmail: bank.beneficiaryEmail,
    beneficiaryAddress: bank.beneficiaryAddress,
    beneficiaryCity: bank.beneficiaryCity,
    beneficiaryState: bank.beneficiaryState,
    beneficiaryCountry: bank.beneficiaryCountry,
    beneficiaryCountryRegion: bank.beneficiaryCountryRegion,
    bankName,
    bankAccountName: bankName,
    accountName,
    bankAddress: bank.bankAddress,
    accountNumber: bank.accountNumber,
    swiftCode: bank.swiftCode,
    paymentReference: bank.paymentReference,
    iban: bank.iban,
    routingNumber: bank.routingNumber,
    ifscNumber: bank.ifscNumber,
    purposeCode: bank.purposeCode,
    bsbCode: bank.bsbCode,
    correspondenceBankName: bank.correspondenceBankName,
    correspondenceBankAddress: bank.correspondenceBankAddress,
    correspondenceBankSwiftCode: bank.correspondenceBankSwiftCode,
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

/** UI payout radio values from PickupPointStep → API `disbursementOption`. */
export function mapUiPayoutMethodToDisbursementOption(
  payoutMethod: string,
): DisbursementOption | undefined {
  switch (payoutMethod) {
    case "electronic_transfer_100":
      return "ELECTRONIC_TRANSFER";
    case "card_100":
      return "CARD";
    case "card_75_cash_25":
      return "CARD_AND_CASH";
    case "electronic_75_cash_25":
      return "CASH_AND_TRANSFER";
    default:
      return undefined;
  }
}

function disbursementOptionFromSelection(
  data: Record<string, unknown> | null | undefined,
): Pick<CreateTransactionRequest, "disbursementOption"> {
  const payoutMethod =
    typeof data?.payoutMethod === "string" && data.payoutMethod.trim()
      ? data.payoutMethod
      : undefined;

  if (!payoutMethod) return {};

  const disbursementOption = mapUiPayoutMethodToDisbursementOption(payoutMethod);
  if (!disbursementOption) return {};

  return { disbursementOption };
}

/** Set by the buy vs sell route / agent flow — not inferred from currency fields. */
export type TransactionPayloadMode = "BUY" | "SELL";

function normalizeFxCurrency(currency?: string): string | undefined {
  if (typeof currency !== "string") return undefined;
  const normalized = currency.trim().toUpperCase();
  return normalized || undefined;
}

type LocalNgnBankDetails = {
  bankName: unknown;
  accountNumber: unknown;
  accountName: unknown;
};

type DomiciliaryBankDetails = {
  accountNumber: unknown;
  bankName: unknown;
  accountName: unknown;
  swiftCode: unknown;
  routingNumber: unknown;
  bankAddress: unknown;
  currency: string;
};

/** Local NGN account from the dedicated buy refund step. */
function localRefundBankDetailsFromPickup(
  data: Record<string, unknown> | null | undefined,
): LocalNgnBankDetails | undefined {
  if (!data) return undefined;

  const refund = data.refundBankAccount as
    | { bankName?: unknown; accountNumber?: unknown; accountName?: unknown }
    | undefined;
  if (refund?.bankName && refund.accountNumber && refund.accountName) {
    return {
      bankName: refund.bankName,
      accountNumber: refund.accountNumber,
      accountName: refund.accountName,
    };
  }

  return undefined;
}

/** Local NGN payout account — only when electronic transfer was selected. */
function localPayoutBankDetailsFromPickup(
  data: Record<string, unknown> | null | undefined,
): LocalNgnBankDetails | undefined {
  if (!data || !usesElectronicLocalPayout(data)) return undefined;

  const payoutBank = data.bankAccount as
    | { bankName?: unknown; accountNumber?: unknown; accountName?: unknown }
    | undefined;
  if (payoutBank?.bankName && payoutBank.accountNumber && payoutBank.accountName) {
    return {
      bankName: payoutBank.bankName,
      accountNumber: payoutBank.accountNumber,
      accountName: payoutBank.accountName,
    };
  }

  return undefined;
}

/** Sell prepaid-card vs electronic-transfer, or buy payout methods that pay to a local NGN account. */
function usesElectronicLocalPayout(
  data: Record<string, unknown> | null | undefined,
): boolean {
  if (!data) return false;
  if (data.preference === "bank") return true;
  if (data.preference === "pickup") return false;

  const payoutMethod =
    typeof data.payoutMethod === "string" ? data.payoutMethod.trim() : "";
  return (
    payoutMethod === "electronic_transfer_100" ||
    payoutMethod === "electronic_75_cash_25"
  );
}

/**
 * Domiciliary account details.
 * Buy payout: `domAccountDetails` (only present when payout method needs Dom).
 * Sell refund: `refundDomiciliaryAccount`.
 */
function domiciliaryBankDetailsFromPickup(
  data: Record<string, unknown> | null | undefined,
  currency?: string,
): DomiciliaryBankDetails | undefined {
  if (!data) return undefined;

  const sellRefundDom = data.refundDomiciliaryAccount as
    | DomiciliaryAccountFormFields
    | undefined;
  const buyPayoutDom = data.domAccountDetails as DomiciliaryAccountFormFields | undefined;
  const dom = sellRefundDom ?? buyPayoutDom;
  if (!dom) return undefined;

  return {
    accountNumber: dom.domiciliaryAccountNumber,
    bankName: dom.domiciliaryBankName,
    accountName: dom.accountName,
    swiftCode: dom.swiftCode,
    routingNumber: dom.routingNumber,
    bankAddress: dom.bankAddress,
    currency: normalizeFxCurrency(currency) ?? "USD",
  };
}

type DomiciliaryAccountFormFields = {
  domiciliaryAccountNumber?: unknown;
  domiciliaryBankName?: unknown;
  accountName?: unknown;
  swiftCode?: unknown;
  routingNumber?: unknown;
  bankAddress?: unknown;
};

/**
 * Single FX bank-details mapping (follows selected payout method):
 * - BUY: beneficiary = Dom when payout needs it (+ currency); refund = local NGN
 * - SELL: beneficiary = local NGN only for electronic transfer; refund = Dom (+ currency)
 *   Prepaid card / pickup → no local beneficiaryDetails
 */
function fxBeneficiaryAndRefundDetails(
  mode: TransactionPayloadMode,
  pickup: Record<string, unknown> | null | undefined,
  currency?: string,
): Pick<CreateTransactionRequest, "beneficiaryDetails" | "refundBankDetails"> {
  const domiciliary = domiciliaryBankDetailsFromPickup(pickup, currency);

  if (mode === "SELL") {
    return {
      beneficiaryDetails: localPayoutBankDetailsFromPickup(pickup),
      refundBankDetails: domiciliary,
    };
  }

  return {
    beneficiaryDetails: domiciliary,
    refundBankDetails: localRefundBankDetailsFromPickup(pickup),
  };
}

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
    scheduledPickupDate: (data as { pickupDate?: string }).pickupDate,
    scheduledPickupTime: (data as { pickupTime?: string }).pickupTime,
  };
}

function buildPTAPayload(
  bag: TransactionFormDataBag,
  documents: TransactionDocument[]
): CreateTransactionRequest {
  const upload = bag.uploadDocumentsData as Record<string, unknown> | null;
  const amount = bag.transactionAmountData;
  const pickup = bag.pickupPointData;
  const payout = disbursementOptionFromSelection(pickup);

  return {
    type: "PTA",
    currency: getCurrency(amount),
    amount: getAmount(amount),
    purpose: getCustomerFxPurposeForPayload("PTA", "BUY"),
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
    ...fxBeneficiaryAndRefundDetails("BUY", pickup, getCurrency(amount)),
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
  const payout = disbursementOptionFromSelection(pickup);

  return {
    type: "BTA",
    currency: getCurrency(amount),
    amount: getAmount(amount),
    purpose: getCustomerFxPurposeForPayload("BTA", "BUY"),
    destinationCountry: "United States",
    bvn: typeof upload?.bvn === "string" ? upload.bvn : undefined,
    nin: typeof upload?.ninNumber === "string" ? upload.ninNumber : undefined,
    tinNumber: pickOptionalString(upload?.tinNumber),
    formAId: typeof upload?.formAId === "string" ? upload.formAId : undefined,
    passportDocumentNumber:
      typeof upload?.passportDocumentNumber === "string" ? upload.passportDocumentNumber : undefined,
    passportIssueDate:
      typeof upload?.passportIssueDate === "string" ? upload.passportIssueDate : undefined,
    passportExpiryDate:
      typeof upload?.passportExpiryDate === "string" ? upload.passportExpiryDate : undefined,
    documents,
    ...payout,
    ...fxBeneficiaryAndRefundDetails("BUY", pickup, getCurrency(amount)),
    pickupLocation: buildPickupLocation(pickup ?? null),
  };
}

function buildTouristPayload(
  bag: TransactionFormDataBag,
  documents: TransactionDocument[],
  mode: TransactionPayloadMode
): CreateTransactionRequest {
  const upload = bag.uploadDocumentsData as Record<string, string | any> | null;
  const amount = bag.transactionAmountData;
  const pickup = bag.pickupPointData;

  if (mode === "SELL") {
    return {
      type: "TOURIST_FX",
      currency: getCurrency(amount),
      amount: getAmount(amount),
      purpose: getCustomerFxPurposeForPayload("TOURIST_FX", mode),
      destinationCountry: "United States",
      passportDocumentNumber: upload?.passportDocumentNumber ?? undefined,
      passportIssueDate: upload?.passportIssueDate ?? undefined,
      passportExpiryDate: upload?.passportExpiryDate ?? undefined,
      address: upload?.nigerianAddress ?? undefined,
      documents,
      pickupLocation: buildPickupLocation(pickup ?? null),
      digitalSignature: digitalSignatureFromAmount(amount),
      ...fxBeneficiaryAndRefundDetails("SELL", pickup, getCurrency(amount)),
      ...disbursementOptionFromPickupOrBankPreference(pickup),
    };
  }

  const payout = disbursementOptionFromSelection(pickup);

  return {
    type: "TOURIST_FX",
    currency: getCurrency(amount),
    amount: getAmount(amount),
    purpose: getCustomerFxPurposeForPayload("TOURIST_FX", mode),
    destinationCountry: "United States",
    formAId: upload?.formAId ?? undefined,
    passportDocumentNumber: upload?.passportDocumentNumber ?? undefined,
    passportIssueDate: upload?.passportIssueDate ?? undefined,
    passportExpiryDate: upload?.passportExpiryDate ?? undefined,
    address: upload?.nigerianAddress ?? undefined,
    documents,
    ...payout,
    ...fxBeneficiaryAndRefundDetails("BUY", pickup, getCurrency(amount)),
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
    purpose: getCustomerFxPurposeForPayload("SCHOOL_FEES", "BUY"),
    destinationCountry: "United Kingdom",
    studentName: pickOptionalString(upload?.studentName),
    studentNin: pickOptionalString(upload?.studentNinNumber),
    studentPassportDocumentNumber: pickOptionalString(upload?.studentPassportDocumentNumber),
    studentPassportIssueDate: pickOptionalString(upload?.studentPassportIssueDate),
    studentPassportExpiryDate: pickOptionalString(upload?.studentPassportExpiryDate),
    formAId: pickOptionalString(upload?.formAId),
    admissionType: mapUiAdmissionTypeToApi(
      typeof upload?.admissionType === "string" ? upload.admissionType : undefined,
    ),
    nin: pickOptionalString(upload?.ninNumber),
    passportDocumentNumber: pickOptionalString(upload?.passportDocumentNumber),
    passportIssueDate: pickOptionalString(upload?.passportIssueDate),
    passportExpiryDate: pickOptionalString(upload?.passportExpiryDate),
    beneficiaryDetails: beneficiaryDetailsFromBankForm(bank),
    refundBankDetails: localRefundBankDetailsFromPickup(bag.pickupPointData),
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
    purpose: getCustomerFxPurposeForPayload("MEDICAL", "BUY"),
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
    refundBankDetails: localRefundBankDetailsFromPickup(bag.pickupPointData),
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
    purpose: getCustomerFxPurposeForPayload("PROFESSIONAL_BODY", "BUY"),
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
    refundBankDetails: localRefundBankDetailsFromPickup(bag.pickupPointData),
    documents,
  };
}

function disbursementOptionFromPickupOrBankPreference(
  data: Record<string, unknown> | null | undefined
): Pick<CreateTransactionRequest, "disbursementOption"> {
  if (!data) return {};
  if (data.preference === "bank") {
    return { disbursementOption: "ELECTRONIC_TRANSFER" };
  }
  if (data.preference === "pickup") {
    return { disbursementOption: "CARD" };
  }
  return {};
}

/** Initials-only digital signature from the sell amount step (file signatures upload separately). */
function digitalSignatureFromAmount(
  amount: Record<string, unknown> | null | undefined,
): string | undefined {
  if (!amount) return undefined;
  if (amount.sourceOfFundsSignatureMode === "upload") return undefined;
  const initials =
    typeof amount.sourceOfFundsInitials === "string"
      ? amount.sourceOfFundsInitials.trim()
      : "";
  return initials || undefined;
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
    purpose: getCustomerFxPurposeForPayload("RESIDENT_FX", "SELL"),
    destinationCountry: "United States",
    bvn: upload?.bvn ?? undefined,
    nin: upload?.ninNumber ?? undefined,
    tinNumber: pickOptionalString(upload?.tinNumber),
    passportDocumentNumber: upload?.passportDocumentNumber ?? undefined,
    passportIssueDate:
      typeof upload?.passportIssueDate === "string" ? upload.passportIssueDate : undefined,
    passportExpiryDate:
      typeof upload?.passportExpiryDate === "string" ? upload.passportExpiryDate : undefined,
    documents,
    pickupLocation: buildPickupLocation(pickup ?? null),
    digitalSignature: digitalSignatureFromAmount(amount),
    ...fxBeneficiaryAndRefundDetails("SELL", pickup, getCurrency(amount)),
    ...disbursementOptionFromPickupOrBankPreference(pickup),
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
    purpose: getCustomerFxPurposeForPayload("EXPATRIATE_FX", "SELL"),
    destinationCountry: "United States",
    bvn: upload?.bvn ?? undefined,
    nin: upload?.ninNumber ?? undefined,
    passportDocumentNumber: upload?.passportDocumentNumber ?? undefined,
    passportIssueDate: upload?.passportIssueDate ?? undefined,
    passportExpiryDate: upload?.passportExpiryDate ?? undefined,
    documents,
    pickupLocation: buildPickupLocation(pickup ?? null),
    digitalSignature: digitalSignatureFromAmount(amount),
    ...fxBeneficiaryAndRefundDetails("SELL", pickup, getCurrency(amount)),
    ...disbursementOptionFromPickupOrBankPreference(pickup),
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
      payload = buildTouristPayload(bag, documents, mode);
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
