import type { DocumentType, TransactionType } from "./transaction-document-requirements";
import { isAmountOverRequiredAmount } from "@/app/(customer)/_components/transactions/forms/amount-step-utils";

export interface DocumentUploadSpec {
  files: File[];
  documentTypes: DocumentType[];
}

type UploadStepData = Record<string, unknown>;

export function isUploadableFile(value: unknown): value is File {
  if (typeof File !== "undefined" && value instanceof File) return true;
  if (value instanceof Blob && typeof (value as File).name === "string") return true;
  return false;
}

function hasFile(value: unknown): value is File {
  return isUploadableFile(value);
}

function collectFileAndType(
  data: UploadStepData,
  field: string,
  documentType: DocumentType,
  acc: DocumentUploadSpec
): void {
  const raw = data[field];
  if (hasFile(raw)) {
    acc.files.push(raw);
    acc.documentTypes.push(documentType);
  }
}

/**
 * Returns files and document types to upload for the given transaction type and upload-step form data.
 * For school fees, pass `bankDetailsData` so the optional bank-step invoice is uploaded as `BANK_VERIFICATION`
 * (school invoice from the documents step remains `INVOICE` via `schoolInvoiceFile`).
 * Pure function: no side effects, easily testable.
 */
export function getDocumentUploadSpec(
  transactionType: TransactionType,
  uploadStepData: UploadStepData | null,
  bankDetailsData?: UploadStepData | null
): DocumentUploadSpec | null {
  if (!uploadStepData || typeof uploadStepData !== "object") return null;

  const spec: DocumentUploadSpec = { files: [], documentTypes: [] };

  switch (transactionType) {
    case "PTA":
      collectFileAndType(uploadStepData, "passportFile", "PASSPORT", spec);
      collectFileAndType(uploadStepData, "visaFile", "VISA", spec);
      collectFileAndType(uploadStepData, "returnTicketFile", "RETURN_TICKET", spec);
      break;
    case "BTA":
      // Buy FX – Business Travel Allowance (BTA)
      collectFileAndType(uploadStepData, "tinCertificateFile", "TIN", spec);
      collectFileAndType(uploadStepData, "tccFile", "TCC", spec);
      collectFileAndType(uploadStepData, "passportFile", "PASSPORT", spec);
      collectFileAndType(uploadStepData, "visaFile", "VISA", spec);
      collectFileAndType(uploadStepData, "returnTicketFile", "RETURN_TICKET", spec);
      collectFileAndType(uploadStepData, "letterFromCompanyFile", "CORPORATE_BODY_LETTER", spec);
      collectFileAndType(uploadStepData, "letterOfInvitationFile", "PARTNER_INVITATION_LETTER", spec);
      break;
    case "TOURIST_FX":
      collectFileAndType(uploadStepData, "visaFile", "VISA", spec);
      collectFileAndType(uploadStepData, "passportFile", "PASSPORT", spec);
      collectFileAndType(uploadStepData, "returnTicketFile", "RETURN_TICKET", spec);
      collectFileAndType(uploadStepData, "receiptForInitialNairaPurchaseFile", "RECEIPT", spec);
      break;
    case "SCHOOL_FEES":
      collectFileAndType(uploadStepData, "studentPassportFile", "STUDENT_PASSPORT", spec);
      collectFileAndType(uploadStepData, "passportFile", "PASSPORT", spec);
      collectFileAndType(uploadStepData, "evidenceOfAdmissionFile", "SCHOOL_ADMISSION", spec);
      collectFileAndType(uploadStepData, "schoolInvoiceFile", "INVOICE", spec);
      collectFileAndType(uploadStepData, "statementOfResultFile", "STATEMENT_OF_RESULT", spec);
      collectFileAndType(uploadStepData, "firstDegreeCertificateFile", "DEGREE", spec);
      if (bankDetailsData && typeof bankDetailsData === "object") {
        collectFileAndType(bankDetailsData, "invoiceFile", "BANK_VERIFICATION", spec);
      }
      break;
    case "MEDICAL":
      // Buy FX – Medical
      collectFileAndType(uploadStepData, "passportFile", "PASSPORT", spec);
      collectFileAndType(uploadStepData, "visaFile", "VISA", spec);
      collectFileAndType(uploadStepData, "returnTicketFile", "RETURN_TICKET", spec);
      collectFileAndType(uploadStepData, "referenceLetterFromDoctorFile", "MEDICAL_LETTER", spec);
      collectFileAndType(uploadStepData, "letterFromOverseasDoctorFile", "OVERSEAS_MEDICAL_LETTER", spec);
      break;
    case "PROFESSIONAL_BODY":
      // Buy FX – Professional Fees
      collectFileAndType(uploadStepData, "passportFile", "PASSPORT", spec);
      collectFileAndType(uploadStepData, "evidenceOfMembershipFile", "MEMBERSHIP_CARD", spec);
      collectFileAndType(uploadStepData, "invoiceFromProfessionalBodyFile", "INVOICE", spec);
      if (bankDetailsData && typeof bankDetailsData === "object") {
        collectFileAndType(bankDetailsData, "invoiceFile", "BANK_VERIFICATION", spec);
      }
      break;
    case "RESIDENT_FX":
      // Sell FX – Resident FX
      collectFileAndType(uploadStepData, "internationalPassportFile", "PASSPORT", spec);
      collectFileAndType(uploadStepData, "utilityBillFile", "UTILITY_BILL", spec);
      break;
    case "EXPATRIATE_FX":
      // Sell FX – Expatriate FX
      collectFileAndType(uploadStepData, "internationalPassportFile", "PASSPORT", spec);
      collectFileAndType(uploadStepData, "workPermitFile", "WORK_PERMIT", spec);
      collectFileAndType(uploadStepData, "utilityBillFile", "UTILITY_BILL", spec);
      break;
    default:
      return null;
  }

  if (spec.files.length === 0) return null;
  return spec;
}

type AmountStepData = Record<string, unknown>;

function hasFileArray(value: unknown): value is File[] {
  return Array.isArray(value) && value.length > 0 && value.every((v) => isUploadableFile(v));
}

function isSellFxType(transactionType: TransactionType): boolean {
  return (
    transactionType === "RESIDENT_FX" ||
    transactionType === "EXPATRIATE_FX" ||
    transactionType === "TOURIST_FX"
  );
}


function getStringField(data: AmountStepData, key: string): string {
  const v = data[key];
  return typeof v === "string" ? v : "";
}


function readSignature(data: AmountStepData): {
  mode: "initials" | "upload";
  initials: string;
  file: File | null;
} {
  const mode = data.sourceOfFundsSignatureMode === "upload" ? "upload" : "initials";
  if (mode === "upload") {
    return {
      mode,
      initials: "",
      file: isUploadableFile(data.sourceOfFundsSignatureFile)
        ? data.sourceOfFundsSignatureFile
        : null,
    };
  }
  const initials =
    typeof data.sourceOfFundsInitials === "string" ? data.sourceOfFundsInitials.trim() : "";
  return { mode, initials, file: null };
}

/**
 * Additional documents for SELL transactions over $10,000 (Resident/Expatriate/Tourist sell).
 * Reads from transaction amount step data.
 */
export function getSellOver10kDocumentUploadSpec(
  transactionType: TransactionType,
  amountStepData: AmountStepData | null
): DocumentUploadSpec | null {
  if (!amountStepData || typeof amountStepData !== "object") return null;

  if (!isSellFxType(transactionType)) return null;

  const receiveAmount = getStringField(amountStepData, "receiveAmount");
  const receiveCurrency = getStringField(amountStepData, "receiveCurrency");
  const sendAmount = getStringField(amountStepData, "sendAmount");
  const sendCurrency = getStringField(amountStepData, "sendCurrency");
  if (!isAmountOverRequiredAmount(receiveAmount, receiveCurrency, sendAmount, sendCurrency)) return null;

  const signature = readSignature(amountStepData);

  const spec: DocumentUploadSpec = { files: [], documentTypes: [] };

  const proofFilesRaw = amountStepData.proofOfFundsFiles;
  if (hasFileArray(proofFilesRaw)) {
    for (const f of proofFilesRaw) {
      spec.files.push(f);
      spec.documentTypes.push("PROOF_OF_FUNDS");
    }
  }

  // Initials go on the transaction payload as `digitalSignature` (text field).
  // Only upload an actual signature file as DIGITAL_SIGNATURE.
  if (signature.mode === "upload" && signature.file) {
    spec.files.push(signature.file);
    spec.documentTypes.push("DIGITAL_SIGNATURE");
  }

  if (spec.files.length === 0) return null;
  return spec;
}

/** Combines multiple upload specs (e.g. step documents + over-threshold proof/signature). */
export function mergeDocumentUploadSpecs(
  ...specs: Array<DocumentUploadSpec | null | undefined>
): DocumentUploadSpec | null {
  const files: File[] = [];
  const documentTypes: DocumentUploadSpec["documentTypes"] = [];

  for (const spec of specs) {
    if (!spec) continue;
    files.push(...spec.files);
    documentTypes.push(...spec.documentTypes);
  }

  if (files.length === 0) return null;
  return { files, documentTypes };
}
