export const SHAREHOLDER_FUNDS_NGN = 2_000_000_000;
export const NOP_LIMIT_NGN = 600_000_000; // 30% of SHF
export const NOP_AMBER_THRESHOLD_NGN = 480_000_000; // 80% of limit

export type NopComplianceStatus = "green" | "amber" | "red";

export function getNopCompliance(currentNop: number): {
  status: NopComplianceStatus;
  utilizationPercent: number;
} {
  const utilizationPercent = Math.round((currentNop / NOP_LIMIT_NGN) * 100);

  let status: NopComplianceStatus = "green";
  if (currentNop >= NOP_LIMIT_NGN) {
    status = "red";
  } else if (currentNop >= NOP_AMBER_THRESHOLD_NGN) {
    status = "amber";
  }

  return { status, utilizationPercent };
}

export const NOP_BADGE_STYLES: Record<
  NopComplianceStatus,
  { bg: string; text: string }
> = {
  green: { bg: "bg-success-50", text: "text-success-700" },
  amber: { bg: "bg-warning-50", text: "text-warning-700" },
  red: { bg: "bg-error-50", text: "text-error-700" },
};
