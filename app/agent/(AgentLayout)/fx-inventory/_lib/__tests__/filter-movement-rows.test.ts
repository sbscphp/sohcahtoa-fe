import { describe, expect, it } from "vitest";
import { filterMovementRowsByQuery } from "../filter-movement-rows";
import type { AgentPaymentMovementItem } from "@/app/_lib/api/types";

const base = (over: Partial<AgentPaymentMovementItem>): AgentPaymentMovementItem => ({
  transaction_id: "id-1",
  transaction_date: "2026-01-01T00:00:00.000Z",
  ...over,
});

describe("filterMovementRowsByQuery", () => {
  it("returns all rows when query is empty", () => {
    const rows = [base({ transaction_id: "a" }), base({ transaction_id: "b" })];
    expect(filterMovementRowsByQuery(rows, "")).toEqual(rows);
    expect(filterMovementRowsByQuery(rows, "   ")).toEqual(rows);
  });

  it("filters by transaction id substring", () => {
    const rows = [
      base({ transaction_id: "add37477-e4c9-4b85-99a0-0d28a9266fc1" }),
      base({ transaction_id: "other-id" }),
    ];
    const out = filterMovementRowsByQuery(rows, "add37477");
    expect(out).toHaveLength(1);
    expect(out[0].transaction_id).toContain("add37477");
  });
});
