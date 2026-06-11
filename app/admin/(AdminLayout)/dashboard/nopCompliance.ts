export type NopComplianceStatus = "green" | "amber" | "red";

export function getUnsettledNopUtilization(
  balance: number,
  comparisonLimit: number
): number {
  if (!comparisonLimit) return 0;
  return Math.round((balance / comparisonLimit) * 100);
}

export function mapApiColorToStatus(
  color?: string | null,
  utilizationPercent?: number
): NopComplianceStatus {
  const normalized = color?.trim().toLowerCase();
  if (normalized === "red") return "red";
  if (normalized === "amber") return "amber";
  if (normalized === "green") return "green";

  if (utilizationPercent != null) {
    if (utilizationPercent >= 100) return "red";
    if (utilizationPercent >= 80) return "amber";
  }

  return "green";
}

export const NOP_BADGE_STYLES: Record<
  NopComplianceStatus,
  { bg: string; text: string }
> = {
  green: { bg: "bg-success-50", text: "text-success-700" },
  amber: { bg: "bg-warning-50", text: "text-warning-700" },
  red: { bg: "bg-error-50", text: "text-error-700" },
};
