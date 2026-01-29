export type TransactionType =
  | "pta" // Personal Travel Allowance
  | "business"
  | "school-fees"
  | "medical"
  | "professional-body"
  | "tourist"
  | "resident" // Sell FX
  | "touring-nigeria" // Sell FX Tourist
  | "expatriate"; // Sell FX Expatriate

export type TransactionStep =
  | "upload-documents"
  | "amount"
  | "pickup-point"
  | "bank-details";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Step order by transaction type (last step varies: pickup-point vs bank-details) */
const STEPS_BY_TYPE: Record<TransactionType, TransactionStep[]> = {
  pta: ["upload-documents", "amount", "pickup-point"],
  business: ["upload-documents", "amount", "pickup-point"],
  "school-fees": ["upload-documents", "amount", "bank-details"],
  medical: ["upload-documents", "amount", "bank-details"],
  "professional-body": ["upload-documents", "amount", "bank-details"],
  tourist: ["upload-documents", "amount", "pickup-point"],
  resident: ["upload-documents", "amount", "pickup-point"],
  "touring-nigeria": ["upload-documents", "amount", "pickup-point"],
  expatriate: ["upload-documents", "amount", "pickup-point"],
};

export function getStepsForTransactionType(type: TransactionType): TransactionStep[] {
  return STEPS_BY_TYPE[type] ?? STEPS_BY_TYPE.pta;
}

/**
 * Get breadcrumbs for "Choose Options" page
 */
export function getChooseOptionsBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Transactions", href: "/transactions" },
    { label: "Choose an Option", href: undefined },
  ];
}

export const STEP_LABELS: Record<TransactionStep, string> = {
  "upload-documents": "Upload Required Document",
  amount: "Enter Amount",
  "pickup-point": "Pick Up Point",
  "bank-details": "Bank Details",
};

/**
 * Get breadcrumbs for transaction creation flow
 * @param pathPrefix - e.g. "transactions" for buy, "transactions/sell" for sell
 */
export function getTransactionBreadcrumbs(
  transactionType: TransactionType,
  currentStep: TransactionStep,
  pathPrefix: string = "transactions"
): BreadcrumbItem[] {
  const base: BreadcrumbItem[] = [
    { label: "Transactions", href: "/transactions" },
    { label: "Choose an Option", href: "/transactions/options" },
  ];

  const steps = getStepsForTransactionType(transactionType);
  const currentIndex = steps.indexOf(currentStep);

  for (let i = 0; i <= currentIndex; i++) {
    const step = steps[i]!;
    base.push({
      label: STEP_LABELS[step],
      href:
        i === currentIndex
          ? undefined
          : `/${pathPrefix}/${transactionType}/${step}`,
    });
  }

  return base;
}

/**
 * Get transaction type label
 */
export function getTransactionTypeLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    pta: "Personal Travel Allowance (PTA)",
    business: "Business Travel Allowance (BTA)",
    "school-fees": "School Fees",
    medical: "Medical Fee",
    "professional-body": "Professional Fee",
    tourist: "Tourist",
    resident: "Residents",
    "touring-nigeria": "Tourist",
    expatriate: "Expatriate",
  };
  return labels[type] || type;
}

/**
 * Get next step in transaction flow
 */
export function getNextTransactionStep(
  currentStep: TransactionStep,
  transactionType: TransactionType = "pta"
): TransactionStep | null {
  const steps = getStepsForTransactionType(transactionType);
  const currentIndex = steps.indexOf(currentStep);
  return currentIndex < steps.length - 1 ? steps[currentIndex + 1]! : null;
}

/**
 * Get previous step in transaction flow
 */
export function getPreviousTransactionStep(
  currentStep: TransactionStep,
  transactionType: TransactionType = "pta"
): TransactionStep | null {
  const steps = getStepsForTransactionType(transactionType);
  const currentIndex = steps.indexOf(currentStep);
  return currentIndex > 0 ? steps[currentIndex - 1]! : null;
}
