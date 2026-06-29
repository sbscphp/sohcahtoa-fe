import { describe, expect, it } from "vitest";
import {
  foreignCurrencyFromPair,
  localCurrencyFromPair,
  movementAmountDisplay,
  movementRowCurrency,
} from "../format-inventory";
import type { AgentPaymentMovementItem } from "@/app/_lib/api/types";

const disbursedRow: AgentPaymentMovementItem = {
  transaction_id: "fd3c985b-2f65-4aca-ae58-858ee8a79f75",
  transaction_date: "2026-06-20T15:02:06.264Z",
  customer_full_name: "Kwame Dubois",
  amount_disbursed: 1,
  currency_pair: "USD/NGN",
  prepaid_amount: null,
  transaction_type: "EXPATRIATE_FX",
};

describe("movementRowCurrency", () => {
  it("uses foreign currency for cash disbursed (USD/NGN → USD)", () => {
    expect(movementRowCurrency(disbursedRow, "cash_disbursed")).toBe("USD");
  });

  it("uses local currency for cash received from customer", () => {
    expect(
      movementRowCurrency(
        { ...disbursedRow, amount_received: 50000 },
        "cash_received_from_customer",
      ),
    ).toBe("NGN");
  });

  it("prefers explicit API currency when provided", () => {
    expect(
      movementRowCurrency(
        { ...disbursedRow, amount_disbursed_currency: "EUR" },
        "cash_disbursed",
      ),
    ).toBe("EUR");
  });
});

describe("movementAmountDisplay", () => {
  it("formats cash disbursed in foreign currency", () => {
    expect(movementAmountDisplay(disbursedRow, "cash_disbursed")).toBe("$1.00");
  });
});

describe("currency pair helpers", () => {
  it("parses foreign and local sides", () => {
    expect(foreignCurrencyFromPair("USD/NGN")).toBe("USD");
    expect(localCurrencyFromPair("USD/NGN")).toBe("NGN");
  });
});
