import { describe, expect, it } from "vitest";
import { formatAccounting, formatMoney, formatSigned } from "../format-fx";

describe("money formatting", () => {
  it("puts the minus before the currency symbol", () => {
    expect(formatMoney(-11000, "USD")).toBe("-$11,000");
    expect(formatMoney(11000, "USD")).toBe("$11,000");
    expect(formatMoney(null, "USD")).toBe("—");
  });

  it("keeps accounting and signed variants intact", () => {
    expect(formatAccounting(-1200, "GBP")).toBe("(£1,200)");
    expect(formatSigned(-1000, "USD")).toBe("-$1,000");
    expect(formatSigned(1000, "USD")).toBe("+$1,000");
  });
});
