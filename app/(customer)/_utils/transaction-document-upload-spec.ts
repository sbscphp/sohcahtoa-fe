import type { DocumentType } from "./transaction-document-requirements";
import type { TransactionType } from "./transaction-document-requirements";

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
