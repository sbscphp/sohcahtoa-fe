import { resolveTransactionPayoutDisplay } from "../resolve-transaction-payout-display";

describe("resolveTransactionPayoutDisplay", () => {
  const linkedAccount = {
    id: "ba-1",
    bankName: "GTBank",
    accountNumber: "0123456789",
    accountName: "Jane Doe",
  };

  it("prioritizes linked bank accounts over beneficiary details", () => {
    expect(
      resolveTransactionPayoutDisplay(
        [linkedAccount],
        { bankName: "GTBank", accountNumber: "0123456789", accountName: "Jane Doe" },
      ),
    ).toEqual({ kind: "bankAccounts", accounts: [linkedAccount] });
  });

  it("shows beneficiary details when no linked accounts", () => {
    const beneficiary = {
      bankName: "Barclays",
      accountNumber: "GB123",
      swiftCode: "BARCGB22",
    };

    expect(resolveTransactionPayoutDisplay([], beneficiary)).toEqual({
      kind: "beneficiary",
      data: beneficiary,
    });
  });

  it("returns none when both are empty", () => {
    expect(resolveTransactionPayoutDisplay([], {})).toEqual({ kind: "none" });
    expect(resolveTransactionPayoutDisplay(null, null)).toEqual({ kind: "none" });
  });
});
