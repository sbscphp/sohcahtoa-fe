
import type { TransactionTypeAPI } from "@/app/_lib/api/types";
import type { DocumentType } from "./transaction-document-requirements";
import { getRequiredDocuments } from "./transaction-document-requirements";

export type { DocumentType };

export function validateRequiredDocuments(
  transactionType: TransactionTypeAPI,
  providedDocuments: {
    bvn?: string;
    nin?: string;
    formAId?: string;
    passportFile?: File | null;
    visaFile?: File | null;
    returnTicketFile?: File | null;
    formAFile?: File | null;
    tin?: string;
    utilityBillFile?: File | null;
    medicalLetterFile?: File | null;
    overseasMedicalLetterFile?: File | null;
    membershipCardFile?: File | null;
    invoiceFile?: File | null;
    corporateBodyLetterFile?: File | null;
    partnerInvitationLetterFile?: File | null;
  }
): DocumentType[] {
  const required = getRequiredDocuments(transactionType);
  const missing: DocumentType[] = [];

  required.forEach((docType) => {
    let isProvided = false;

    switch (docType) {
      case "BVN":
        isProvided = !!providedDocuments.bvn;
        break;
      case "NIN":
        isProvided = !!providedDocuments.nin;
        break;
      case "PASSPORT":
        isProvided = !!providedDocuments.passportFile;
        break;
      case "VISA":
        isProvided = !!providedDocuments.visaFile;
        break;
      case "RETURN_TICKET":
        isProvided = !!providedDocuments.returnTicketFile;
        break;
      case "FORM_A_DOCUMENT":
        isProvided = !!(providedDocuments.formAId && providedDocuments.formAFile);
        break;
      case "TIN":
        isProvided = !!providedDocuments.tin;
        break;
      case "UTILITY_BILL":
        isProvided = !!providedDocuments.utilityBillFile;
        break;
      case "MEDICAL_LETTER":
        isProvided = !!providedDocuments.medicalLetterFile;
        break;
      case "OVERSEAS_MEDICAL_LETTER":
        isProvided = !!providedDocuments.overseasMedicalLetterFile;
        break;
      case "MEMBERSHIP_CARD":
        isProvided = !!providedDocuments.membershipCardFile;
        break;
      case "INVOICE":
        isProvided = !!providedDocuments.invoiceFile;
        break;
      case "CORPORATE_BODY_LETTER":
        isProvided = !!providedDocuments.corporateBodyLetterFile;
        break;
      case "PARTNER_INVITATION_LETTER":
        isProvided = !!providedDocuments.partnerInvitationLetterFile;
        break;
    }

    if (!isProvided) {
      missing.push(docType);
    }
  });

  return missing;
}

export function getDocumentName(documentType: DocumentType): string {
  const names: Record<DocumentType, string> = {
    BVN: "BVN",
    NIN: "NIN",
    PASSPORT: "International Passport",
    VISA: "Valid Visa",
    RETURN_TICKET: "Return Ticket",
    FORM_A_DOCUMENT: "Form A Document",
    TIN: "TIN",
    UTILITY_BILL: "Utility Bill",
    MEDICAL_LETTER: "Medical Letter (Nigerian Specialist or Hospital)",
    OVERSEAS_MEDICAL_LETTER: "Letter from Overseas Doctor/Hospital",
    MEMBERSHIP_CARD: "Evidence of Membership",
    INVOICE: "Invoice from Professional Body",
    CORPORATE_BODY_LETTER: "Corporate Body Letter",
    PARTNER_INVITATION_LETTER: "Partner Invitation Letter",
  };
  return names[documentType] || documentType;
}
