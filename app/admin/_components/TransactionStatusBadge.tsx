import { Badge } from "@mantine/core";
import { TRANSACTION_STATUS_LABELS } from "@/app/admin/_lib/transactions";

type TransactionStatusKey = keyof typeof TRANSACTION_STATUS_LABELS;

const transactionStatusColorMap: Record<TransactionStatusKey, string> = {
  DRAFT: "gray",
  AWAITING_VERIFICATION: "#B54708",
  VERIFICATION_IN_PROGRESS: "#B54708",
  VERIFICATION_COMPLETED: "#2563EB",
  AWAITING_DEPOSIT: "#B54708",
  DEPOSIT_PENDING: "#B54708",
  DEPOSIT_CONFIRMED: "#2563EB",
  COMPLIANCE_REVIEW: "#B54708",
  ADMIN_APPROVAL_PENDING: "#B54708",
  APPROVED: "#027A48",
  DISBURSEMENT_IN_PROGRESS: "#B54708",
  PENDING_RECORD_VALIDATION: "#B54708",
  COMPLETED: "#027A48",
  REJECTED: "red",
  CANCELLED: "#6B7280",
  AWAITING_DISBURSEMENT: "#B54708",
};

interface TransactionStatusBadgeProps {
  status?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "light" | "filled" | "outline" | "dot" | "gradient";
  radius?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function TransactionStatusBadge({
  status,
  size = "md",
  variant = "light",
  radius = "xl",
}: TransactionStatusBadgeProps) {
  const key = (status ?? "").toUpperCase().trim() as TransactionStatusKey;
  const label = TRANSACTION_STATUS_LABELS[key] ?? status ?? "—";
  const color = transactionStatusColorMap[key] ?? "gray";

  return (
    <Badge
      color={color}
      className="capitalize!"
      variant={variant}
      size={size}
      radius={radius}
      styles={{ label: { overflow: "visible", textOverflow: "unset" } }}
    >
      {label}
    </Badge>
  );
}
