import { describe, it, expect } from "vitest";
import {
  buildSellTransactionAmountNotice,
  getSellFxInitiateNotices,
} from "@/app/(customer)/_lib/transaction-initiate-notices";

describe("buildSellTransactionAmountNotice", () => {
  it("describes selling FX and NGN payout", () => {
    const notice = buildSellTransactionAmountNotice({
      sendAmount: "5000",
      sendCurrency: "USD",
      receiveAmount: "7500000",
      receiveCurrency: "NGN",
    });

    expect(notice?.title).toBe("$5,000.00 USD");
    expect(notice?.description).toBe(
      "You are selling $5,000.00 USD. You will be sent approximately ₦7,500,000.00 NGN."
    );
  });
});

describe("getSellFxInitiateNotices", () => {
  it("includes verification and amount rows for resident", () => {
    const notices = getSellFxInitiateNotices("resident", {
      amount: {
        sendAmount: "1000",
        sendCurrency: "USD",
        receiveAmount: "1500000",
        receiveCurrency: "NGN",
      },
    });

    expect(notices).toHaveLength(2);
    expect(notices[0]?.icon).toBe("verify");
    expect(notices[1]?.description).toContain("You are selling");
    expect(notices[1]?.description).toContain("You will be sent approximately");
  });
});
