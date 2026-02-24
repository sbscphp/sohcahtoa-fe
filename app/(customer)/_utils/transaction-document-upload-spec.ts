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
      collectFileAndType(uploadStepData, "passportFile", "PASSPORT", spec);
      collectFileAndType(uploadStepData, "visaFile", "VISA", spec);
      collectFileAndType(uploadStepData, "returnTicketFile", "RETURN_TICKET", spec);
      collectFileAndType(uploadStepData, "formAFile", "FORM_A_DOCUMENT", spec);
      collectFileAndType(uploadStepData, "corporateBodyLetterFile", "CORPORATE_BODY_LETTER", spec);
      collectFileAndType(uploadStepData, "partnerInvitationLetterFile", "PARTNER_INVITATION_LETTER", spec);
      break;
    case "TOURIST_FX":
      collectFileAndType(uploadStepData, "passportFile", "PASSPORT", spec);
      collectFileAndType(uploadStepData, "returnTicketFile", "RETURN_TICKET", spec);
      collectFileAndType(uploadStepData, "formAFile", "FORM_A_DOCUMENT", spec);
      break;
    case "SCHOOL_FEES":
      collectFileAndType(uploadStepData, "formAFile", "FORM_A_DOCUMENT", spec);
      break;
    case "MEDICAL":
      collectFileAndType(uploadStepData, "passportFile", "PASSPORT", spec);
      collectFileAndType(uploadStepData, "visaFile", "VISA", spec);
      collectFileAndType(uploadStepData, "returnTicketFile", "RETURN_TICKET", spec);
      collectFileAndType(uploadStepData, "formAFile", "FORM_A_DOCUMENT", spec);
      collectFileAndType(uploadStepData, "utilityBillFile", "UTILITY_BILL", spec);
      collectFileAndType(uploadStepData, "medicalLetterFile", "MEDICAL_LETTER", spec);
      collectFileAndType(uploadStepData, "overseasMedicalLetterFile", "OVERSEAS_MEDICAL_LETTER", spec);
      break;
    case "PROFESSIONAL_BODY":
      collectFileAndType(uploadStepData, "formAFile", "FORM_A_DOCUMENT", spec);
      collectFileAndType(uploadStepData, "utilityBillFile", "UTILITY_BILL", spec);
      collectFileAndType(uploadStepData, "membershipCardFile", "MEMBERSHIP_CARD", spec);
      collectFileAndType(uploadStepData, "invoiceFile", "INVOICE", spec);
      break;
    default:
      return null;
  }

  if (spec.files.length === 0) return null;
  return spec;
}
