import type { AdmissionType } from "@/app/_lib/api/types";

/** UI select values stored in form state and passed through the transaction bag. */
export const SCHOOL_FEES_ADMISSION_UI = {
  UNDERGRADUATE: "Undergraduate",
  POSTGRADUATE: "Postgraduate",
  OTHER: "Other (high school, pre-school etc)",
} as const;

export type SchoolFeesAdmissionUi =
  (typeof SCHOOL_FEES_ADMISSION_UI)[keyof typeof SCHOOL_FEES_ADMISSION_UI];

export const SCHOOL_FEES_ADMISSION_OPTIONS: { value: SchoolFeesAdmissionUi; label: string }[] =
  [
    { value: SCHOOL_FEES_ADMISSION_UI.UNDERGRADUATE, label: "Undergraduate" },
    { value: SCHOOL_FEES_ADMISSION_UI.POSTGRADUATE, label: "Postgraduate" },
    {
      value: SCHOOL_FEES_ADMISSION_UI.OTHER,
      label: "Other (high school, pre-school etc)",
    },
  ];

export function isOtherAdmissionType(admissionType: string): boolean {
  return admissionType === SCHOOL_FEES_ADMISSION_UI.OTHER || admissionType.startsWith("Other");
}

/** Undergraduate and Other share the same document set (no degree / statement). */
export function requiresUndergraduateStyleDocuments(admissionType: string): boolean {
  return admissionType === SCHOOL_FEES_ADMISSION_UI.UNDERGRADUATE || isOtherAdmissionType(admissionType);
}

export function mapUiAdmissionTypeToApi(
  admissionType: string | undefined | null,
): AdmissionType | undefined {
  if (!admissionType?.trim()) return undefined;
  if (admissionType === SCHOOL_FEES_ADMISSION_UI.UNDERGRADUATE) return "UNDERGRADUATE";
  if (admissionType === SCHOOL_FEES_ADMISSION_UI.POSTGRADUATE) return "POSTGRADUATE";
  if (isOtherAdmissionType(admissionType)) return "OTHER";
  const upper = admissionType.toUpperCase();
  if (upper === "UNDERGRADUATE" || upper === "POSTGRADUATE" || upper === "OTHER") {
    return upper as AdmissionType;
  }
  return undefined;
}

export function mapApiAdmissionTypeToUi(
  admissionType: string | undefined | null,
): SchoolFeesAdmissionUi | "" {
  if (!admissionType?.trim()) return "";
  const upper = admissionType.toUpperCase();
  if (upper === "UNDERGRADUATE") return SCHOOL_FEES_ADMISSION_UI.UNDERGRADUATE;
  if (upper === "POSTGRADUATE") return SCHOOL_FEES_ADMISSION_UI.POSTGRADUATE;
  if (upper === "OTHER") return SCHOOL_FEES_ADMISSION_UI.OTHER;
  if (admissionType === SCHOOL_FEES_ADMISSION_UI.UNDERGRADUATE) return admissionType;
  if (admissionType === SCHOOL_FEES_ADMISSION_UI.POSTGRADUATE) return admissionType;
  if (isOtherAdmissionType(admissionType)) return SCHOOL_FEES_ADMISSION_UI.OTHER;
  return "";
}
