import type {
  AgentDashboardTransactionGroup,
  AgentDashboardTransactionsByTypeSegment,
} from "@/app/_lib/api/types";

/** Re-export for callers that already import from here */
export type TransactionsByTypeGroup = AgentDashboardTransactionGroup;

const BUY_TYPES = new Set<string>([
  "PTA",
  "BTA",
  "SCHOOL_FEES",
  "MEDICAL",
  "PROFESSIONAL_BODY",
  "TOURIST_FX",
]);

const SELL_TYPES = new Set<string>(["RESIDENT_FX", "EXPATRIATE_FX"]);

const RECEIVE_TYPES = new Set<string>(["IMTO_REMITTANCE", "CASH_REMITTANCE"]);

function normalizeTypeCode(type: string): string {
  return type.trim().toUpperCase().replaceAll(/\s+/g, "_");
}

export function getSegmentDashboardGroup(type: string): TransactionsByTypeGroup | "other" {
  const t = normalizeTypeCode(type);
  if (BUY_TYPES.has(t)) return "buy";
  if (SELL_TYPES.has(t)) return "sell";
  if (RECEIVE_TYPES.has(t)) return "receive";
  return "other";
}

export interface SegmentWithShare extends AgentDashboardTransactionsByTypeSegment {
  /** Share of filtered subset (0–100), USD volume only */
  sharePercent: number;
}

/** Positive USD (foreign) volume only — matches dashboard `amountBasis` volume chart */
function segmentVolumeUsd(s: AgentDashboardTransactionsByTypeSegment): number {
  const a = s.totalAmount;
  if (typeof a !== "number" || Number.isNaN(a) || a <= 0) return 0;
  return a;
}

/**
 * Filters by Buy/Sell/Receive and **only segments with volume > 0** so the pie is not
 * polluted by count-only rows (which caused overlapping 0% labels).
 */
export function filterAndPrepareSegments(
  segments: AgentDashboardTransactionsByTypeSegment[],
  group: TransactionsByTypeGroup
): SegmentWithShare[] {
  const filtered = segments.filter((s) => {
    if (segmentVolumeUsd(s) <= 0) return false;
    return getSegmentDashboardGroup(s.transactionType) === group;
  });

  const sumVol = filtered.reduce((acc, s) => acc + segmentVolumeUsd(s), 0);

  return filtered.map((s) => {
    const v = segmentVolumeUsd(s);
    const sharePercent = sumVol > 0 ? Math.round((v / sumVol) * 10000) / 100 : 0;
    return {
      ...s,
      sharePercent,
    };
  });
}
