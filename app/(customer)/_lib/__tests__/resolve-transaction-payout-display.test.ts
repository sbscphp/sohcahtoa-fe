import {
  resolveTransactionPayoutDisplay,
  resolveTransactionPayoutSections,
} from "../resolve-transaction-payout-display";

describe("resolveTransactionPayoutSections", () => {
  const linkedAccount = {
    id: "ba-1",
    bankName: "GTBank",
    accountNumber: "0123456789",
    accountName: "Jane Doe",
  };

  const domiciliary = {
    accountNumber: "1234567890",
    bankName: "Chase Bank",
    accountName: "John Doe",
    swiftCode: "CHASUS33",
    routingNumber: "021000021",
    bankAddress: "1 Wall St",
    isDomiciliaryAccount: true,
  };

  const refundBank = {
    bankName: "GTBank",
    accountNumber: "0123456789",
    accountName: "Jane Doe",
  };

  it("shows domiciliary beneficiary and refund bank together", () => {
    expect(
      resolveTransactionPayoutSections([linkedAccount], domiciliary, refundBank),
    ).toEqual({
      beneficiary: domiciliary,
      refundBank,
      payoutBankAccounts: [],
    });
  });

  it("uses linked bank accounts for sell payout when no refund snapshot", () => {
    expect(resolveTransactionPayoutSections([linkedAccount], null, null)).toEqual({
      beneficiary: null,
      refundBank: null,
      payoutBankAccounts: [linkedAccount],
    });
  });

  it("shows beneficiary details when no linked accounts", () => {
    const beneficiary = {
      bankName: "Barclays",
      accountNumber: "GB123",
      swiftCode: "BARCGB22",
    };

    expect(resolveTransactionPayoutSections([], beneficiary, null)).toEqual({
      beneficiary,
      refundBank: null,
      payoutBankAccounts: [],
    });
  });

  it("returns empty sections when all inputs are empty", () => {
    expect(resolveTransactionPayoutSections([], {}, {})).toEqual({
      beneficiary: null,
      refundBank: null,
      payoutBankAccounts: [],
    });
    expect(resolveTransactionPayoutSections(null, null, null)).toEqual({
      beneficiary: null,
      refundBank: null,
      payoutBankAccounts: [],
    });
  });
});

describe("resolveTransactionPayoutDisplay (legacy)", () => {
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
