
export type TransactionType =
  | "PTA"
  | "BTA"
  | "SCHOOL_FEES"
  | "MEDICAL"
  | "PROFESSIONAL_BODY"
  | "TOURIST_FX"
  | "RESIDENT_FX"
  | "EXPATRIATE_FX"
  | "IMTO_REMITTANCE"
  | "CASH_REMITTANCE";

export type DocumentType =
  | "BVN"
  | "NIN"
  | "PASSPORT"
  | "VISA"
  | "RETURN_TICKET"
  | "FORM_A_DOCUMENT"
  | "TIN"
  | "CORPORATE_BODY_LETTER"
  | "PARTNER_INVITATION_LETTER"
  | "UTILITY_BILL"
  | "MEDICAL_LETTER"
  | "OVERSEAS_MEDICAL_LETTER"
  | "MEMBERSHIP_CARD"
  | "INVOICE";

export const TRANSACTION_DOCUMENT_REQUIREMENTS: Record<TransactionType, DocumentType[]> = {
  PTA: ["BVN", "NIN", "PASSPORT", "VISA", "RETURN_TICKET", "FORM_A_DOCUMENT"],
  BTA: [
    "BVN",
    "TIN",
    "PASSPORT",
    "VISA",
    "RETURN_TICKET",
    "FORM_A_DOCUMENT",
    "CORPORATE_BODY_LETTER",
    "PARTNER_INVITATION_LETTER",
  ],
  SCHOOL_FEES: ["FORM_A_DOCUMENT"],
  MEDICAL: [
    "BVN",
    "NIN",
    "PASSPORT",
    "VISA",
    "RETURN_TICKET",
    "FORM_A_DOCUMENT",
    "UTILITY_BILL",
    "MEDICAL_LETTER",
    "OVERSEAS_MEDICAL_LETTER",
  ],
  PROFESSIONAL_BODY: ["BVN", "FORM_A_DOCUMENT", "UTILITY_BILL", "MEMBERSHIP_CARD", "INVOICE"],
  TOURIST_FX: ["BVN", "NIN", "PASSPORT", "RETURN_TICKET", "FORM_A_DOCUMENT"],
  RESIDENT_FX: ["BVN", "NIN", "PASSPORT", "FORM_A_DOCUMENT"],
  EXPATRIATE_FX: ["PASSPORT", "VISA", "FORM_A_DOCUMENT"],
  IMTO_REMITTANCE: ["BVN", "NIN", "FORM_A_DOCUMENT"],
  CASH_REMITTANCE: ["BVN", "NIN", "FORM_A_DOCUMENT"],
};


export function getRequiredDocuments(transactionType: TransactionType): DocumentType[] {
  return TRANSACTION_DOCUMENT_REQUIREMENTS[transactionType] || [];
}


export function isDocumentRequired(
  transactionType: TransactionType,
  documentType: DocumentType
): boolean {
  return getRequiredDocuments(transactionType).includes(documentType);
}

export function mapUITypeToAPIType(uiType: string): TransactionType | null {
  const mapping: Record<string, TransactionType> = {
    pta: "PTA",
    business: "BTA",
    "school-fees": "SCHOOL_FEES",
    medical: "MEDICAL",
    "professional-body": "PROFESSIONAL_BODY",
    tourist: "TOURIST_FX",
    resident: "RESIDENT_FX",
    expatriate: "EXPATRIATE_FX",
    imto: "IMTO_REMITTANCE",
    "cash-remittance": "CASH_REMITTANCE",
  };
  return mapping[uiType.toLowerCase()] || null;
}
