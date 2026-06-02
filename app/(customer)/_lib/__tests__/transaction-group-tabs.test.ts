import {
  resolveTransactionListGroup,
  TRANSACTION_GROUP_TAB_ALL,
} from "../transaction-group-tabs";

describe("transaction-group-tabs", () => {
  it("returns undefined group for All tab", () => {
    expect(resolveTransactionListGroup(TRANSACTION_GROUP_TAB_ALL)).toBeUndefined();
  });

  it("maps Buy/Sell/Receive tabs to API groups", () => {
    expect(resolveTransactionListGroup("Buy FX")).toBe("BUY");
    expect(resolveTransactionListGroup("Sell FX")).toBe("SELL");
    expect(resolveTransactionListGroup("Receive FX")).toBe("REMITTANCE");
  });
});
