import { toSentenceCase } from "./toSentence";

const TRANSACTION_TYPE_LABELS = {
  PTA: "PTA",
  BTA: "BTA",
  SCHOOL_FEES: "School Fees",
  MEDICAL: "Medical",
  PROFESSIONAL_BODY: "Professional Body",
  TOURIST_FX: "Tourist FX",
  RESIDENT_FX: "Resident FX",
  EXPATRIATE_FX: "Expatriate FX",
  IMTO_REMITTANCE: "IMTO Remittance",
  CASH_REMITTANCE: "Cash Remittance",
} as const;

export const formatTransactionTypeForTables = (type: string) => {
  return TRANSACTION_TYPE_LABELS[type as keyof typeof TRANSACTION_TYPE_LABELS] ?? toSentenceCase(type);
};