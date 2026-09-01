export const APPROVAL_TYPE_OPTIONS: ApprovalTypeOption[] = [
    { value: "TRANSACTION", label: "Compliance Review Approval" },
    { value: "DISBURSEMENT", label: "Operations Review Approval" },
    { value: "REFUND", label: "Transaction Refund Approval" },
    { value: "RATE", label: "Rate Approval" },
];

export interface ApprovalTypeOption {
    value: ApprovalTypeValue;
    label: string;
}

export type ApprovalTypeValue = "TRANSACTION" | "DISBURSEMENT" | "REFUND" | "RATE";

export function approvalTypeLabel(value: ApprovalTypeValue | ""): string {
    return APPROVAL_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? "";
}