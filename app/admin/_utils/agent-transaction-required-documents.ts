import type { AgentTransactionRequiredDocuments } from "@/app/admin/_services/admin-api";

const PLACEHOLDER = "—";

const TEXT_FIELDS: ReadonlyArray<{ key: keyof AgentTransactionRequiredDocuments; label: string }> = [
  { key: "bvn", label: "BVN" },
  { key: "nin", label: "NIN" },
  { key: "tin", label: "TIN" },
  { key: "taxClearanceNumber", label: "Tax Clearance Number" },
];

const DOCUMENT_LINK_FIELDS: ReadonlyArray<{
  key: keyof AgentTransactionRequiredDocuments;
  label: string;
}> = [
  { key: "passport", label: "Passport" },
  { key: "visa", label: "Visa" },
  { key: "returnTicket", label: "Return Ticket" },
  { key: "schoolAdmission", label: "School Admission" },
  { key: "invoice", label: "Invoice" },
  { key: "receipt", label: "Receipt" },
];

export type AgentRequiredDocumentDisplayItem =
  | { kind: "text"; label: string; value: string }
  | { kind: "link"; label: string; url: string };

function isBlankValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value !== "string") return true;
  const trimmed = value.trim();
  return trimmed === "" || trimmed === PLACEHOLDER;
}

function isValidDocumentUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getAgentRequiredDocumentDisplayItems(
  docs: AgentTransactionRequiredDocuments | null | undefined
): {
  items: AgentRequiredDocumentDisplayItem[];
  uploadedDocumentsCount: number;
} {
  if (!docs) {
    return { items: [], uploadedDocumentsCount: 0 };
  }

  const items: AgentRequiredDocumentDisplayItem[] = [];

  for (const field of TEXT_FIELDS) {
    const value = docs[field.key];
    if (typeof value === "string" && !isBlankValue(value)) {
      items.push({ kind: "text", label: field.label, value: value.trim() });
    }
  }

  let uploadedDocumentsCount = 0;
  for (const field of DOCUMENT_LINK_FIELDS) {
    const value = docs[field.key];
    if (typeof value === "string" && isValidDocumentUrl(value)) {
      uploadedDocumentsCount += 1;
      items.push({ kind: "link", label: field.label, url: value.trim() });
    }
  }

  return { items, uploadedDocumentsCount };
}
