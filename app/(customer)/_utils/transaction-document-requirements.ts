
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
  | "TCC"
  | "CORPORATE_BODY_LETTER"
  | "PARTNER_INVITATION_LETTER"
  | "UTILITY_BILL"
  | "MEDICAL_LETTER"
  | "OVERSEAS_MEDICAL_LETTER"
  | "MEMBERSHIP_CARD"
  | "INVOICE"
  | "SCHOOL_ADMISSION"
  | "STATEMENT_OF_RESULT"
  | "DEGREE"
  | "RECEIPT"
  | "WORK_PERMIT";

export const TRANSACTION_DOCUMENT_REQUIREMENTS: Record<TransactionType, DocumentType[]> = {
  PTA: ["BVN", "NIN", "PASSPORT", "VISA", "RETURN_TICKET", "FORM_A_DOCUMENT"],
  // Buy FX – Business Travel Allowance (BTA)
  BTA: [
    "TIN",
    "TCC",
    "PASSPORT",
    "VISA",
    "RETURN_TICKET",
    "CORPORATE_BODY_LETTER",
    "PARTNER_INVITATION_LETTER",
  ],
  // Buy FX – School Fees
  SCHOOL_FEES: [
    "PASSPORT",
    "SCHOOL_ADMISSION",
    "INVOICE",
    "STATEMENT_OF_RESULT",
    "DEGREE",
  ],
  // Buy FX – Medical
  MEDICAL: [
    "PASSPORT",
    "VISA",
    "RETURN_TICKET",
    "FORM_A_DOCUMENT",
    "MEDICAL_LETTER",
    "OVERSEAS_MEDICAL_LETTER",
  ],
  // Buy FX – Professional Body
  PROFESSIONAL_BODY: ["MEMBERSHIP_CARD", "INVOICE"],
  // Buy FX – Tourist FX
  TOURIST_FX: ["VISA", "PASSPORT", "RETURN_TICKET", "RECEIPT"],
  // Sell FX – Resident FX
  RESIDENT_FX: ["PASSPORT", "UTILITY_BILL"],
  // Sell FX – Expatriate FX
  EXPATRIATE_FX: ["PASSPORT", "WORK_PERMIT", "UTILITY_BILL"],
  // Remittances – no required docs
  IMTO_REMITTANCE: [],
  CASH_REMITTANCE: [],
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
