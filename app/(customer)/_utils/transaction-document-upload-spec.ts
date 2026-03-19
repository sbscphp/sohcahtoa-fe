import type { DocumentType, TransactionType } from "./transaction-document-requirements";
import { isAmountOver10k } from "@/app/(customer)/_components/transactions/forms/amount-step-utils";

export interface DocumentUploadSpec {
  files: File[];
  documentTypes: DocumentType[];
}

type UploadStepData = Record<string, unknown>;

function hasFile(value: unknown): value is File {
  return value instanceof File;
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
 * Pure function: no side effects, easily testable.
 */
export function getDocumentUploadSpec(
  transactionType: TransactionType,
  uploadStepData: UploadStepData | null
): DocumentUploadSpec | null {
  if (!uploadStepData || typeof uploadStepData !== "object") return null;

  const spec: DocumentUploadSpec = { files: [], documentTypes: [] };

  switch (transactionType) {
    case "PTA":
      collectFileAndType(uploadStepData, "passportFile", "VISA", spec);
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
      // Buy FX – Tourist FX
      collectFileAndType(uploadStepData, "visaFile", "VISA", spec);
      collectFileAndType(uploadStepData, "passportFile", "PASSPORT", spec);
      collectFileAndType(uploadStepData, "returnTicketFile", "RETURN_TICKET", spec);
      collectFileAndType(uploadStepData, "receiptForInitialNairaPurchaseFile", "RECEIPT", spec);
      break;
    case "SCHOOL_FEES":
      // Buy FX – School Fees
      collectFileAndType(uploadStepData, "passportFile", "PASSPORT", spec);
      collectFileAndType(uploadStepData, "evidenceOfAdmissionFile", "SCHOOL_ADMISSION", spec);
      collectFileAndType(uploadStepData, "schoolInvoiceFile", "INVOICE", spec);
      collectFileAndType(uploadStepData, "statementOfResultFile", "STATEMENT_OF_RESULT", spec);
      collectFileAndType(uploadStepData, "firstDegreeCertificateFile", "DEGREE", spec);
      break;
    case "MEDICAL":
      // Buy FX – Medical
      collectFileAndType(uploadStepData, "formAFile", "FORM_A_DOCUMENT", spec);
      collectFileAndType(uploadStepData, "passportFile", "PASSPORT", spec);
      collectFileAndType(uploadStepData, "visaFile", "VISA", spec);
      collectFileAndType(uploadStepData, "returnTicketFile", "RETURN_TICKET", spec);
      collectFileAndType(uploadStepData, "referenceLetterFromDoctorFile", "MEDICAL_LETTER", spec);
      collectFileAndType(uploadStepData, "letterFromOverseasDoctorFile", "OVERSEAS_MEDICAL_LETTER", spec);
      break;
    case "PROFESSIONAL_BODY":
      // Buy FX – Professional Body
      collectFileAndType(uploadStepData, "evidenceOfMembershipFile", "MEMBERSHIP_CARD", spec);
      collectFileAndType(uploadStepData, "invoiceFromProfessionalBodyFile", "INVOICE", spec);
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

function toTextFile(name: string, content: string): File {
  return new File([content], name, { type: "text/plain" });
}

function hasFileArray(value: unknown): value is File[] {
  return Array.isArray(value) && value.every((v) => v instanceof File);
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
      file: data.sourceOfFundsSignatureFile instanceof File ? data.sourceOfFundsSignatureFile : null,
    };
  }
  const initials =
    typeof data.sourceOfFundsInitials === "string" ? data.sourceOfFundsInitials.trim() : "";
  return { mode, initials, file: null };
}

/**
 * Additional documents for SELL transactions >= $10,000 (Resident/Expatriate/Tourist sell).
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
  if (!isAmountOver10k(receiveAmount, receiveCurrency, sendAmount, sendCurrency)) return null;

  const signature = readSignature(amountStepData);

  const spec: DocumentUploadSpec = { files: [], documentTypes: [] };

  const proofFilesRaw = amountStepData.proofOfFundsFiles;
  if (hasFileArray(proofFilesRaw)) {
    for (const f of proofFilesRaw) {
      spec.files.push(f);
      spec.documentTypes.push("PROOF_OF_FUNDS");
    }
  }

  const declarationBody = [
    "SOURCE OF FUNDS DECLARATION",
    "",
    "I declare that the source of funds/income stated in this form is true and correct to the best of my knowledge. I understand that providing false information may result in rejection of my transaction and reporting to the relevant authorities.",
    "",
    signature.mode === "upload"
      ? `Signature: uploaded file (${signature.file?.name ?? "unknown"})`
      : `Signature: initials (${signature.initials || "N/A"})`,
    "",
  ].join("\n");

  spec.files.push(toTextFile("source-of-funds-declaration.txt", declarationBody));
  spec.documentTypes.push("SOURCE_OF_FUNDS_DECLARATION");

  if (signature.mode === "upload" && signature.file) {
    spec.files.push(signature.file);
    spec.documentTypes.push("DIGITAL_SIGNATURE");
  } else if (signature.mode === "initials" && signature.initials) {
    spec.files.push(toTextFile("digital-signature.txt", signature.initials));
    spec.documentTypes.push("DIGITAL_SIGNATURE");
  }

  if (spec.files.length === 0) return null;
  return spec;
}
