export function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function formatCreatedAt(createdAt: string): {
  dateCreated: string;
  timeCreated: string;
} {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return { dateCreated: "--", timeCreated: "--" };
  }
  return {
    dateCreated: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    timeCreated: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

export function formatLedgerDateTime(createdAt: string): { date: string; time: string } {
  const { dateCreated, timeCreated } = formatCreatedAt(createdAt);
  return { date: dateCreated, time: timeCreated };
}

export function normalizeMatchStatus(
  value: string | null | undefined
): "Matched" | "Unmatched" {
  if (!value) return "Unmatched";
  return value.toLowerCase() === "matched" ? "Matched" : "Unmatched";
}

export function mapLedgerType(type: "DEBIT" | "CREDIT"): "Debit" | "Credit" {
  return type === "CREDIT" ? "Credit" : "Debit";
}
