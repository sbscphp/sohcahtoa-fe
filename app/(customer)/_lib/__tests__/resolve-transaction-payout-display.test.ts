import {
  getBeneficiaryDetailRows,
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
    currency: "USD",
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

describe("getBeneficiaryDetailRows", () => {
  it("uses collection order, Organization name only, and curated bank labels", () => {
    const rows = getBeneficiaryDetailRows({
      iban: "GB29NWBK60161331926819",
      schoolName: "Inland Hospital and Co.",
      organizationName: "Inland Hospital and Co.",
      beneficiaryName: "Inland Hospital and Co.",
      name: "Inland Hospital and Co.",
      bankName: "Chase",
      accountName: "Inland Hospital",
      bankAddress: "1 Wall St",
      swiftCode: "CHASUS33",
      accountNumber: "12345678",
      routingNumber: "021000021",
      paymentReference: "INV-22",
      beneficiaryPhone: "08012345678",
      beneficiaryEmail: "ops@hospital.test",
      beneficiaryAddress: "12 Broad St",
      beneficiaryCity: "Lagos",
      beneficiaryState: "Lagos",
      beneficiaryCountry: "Nigeria",
      beneficiaryCountryRegion: "US_CA",
      bankAccountName: "Chase",
    });

    expect(rows.map((row) => row.label)).toEqual([
      "Bank account country / region",
      "Organization name",
      "Phone number",
      "Email",
      "Address",
      "City",
      "State",
      "Country",
      "Bank name",
      "Account name",
      "Bank Address",
      "IBAN",
      "SWIFT/BIC",
      "Bank account number",
      "Payment/Invoice reference number",
      "Routing number",
    ]);
    expect(rows.find((row) => row.key === "organizationName")?.value).toBe(
      "Inland Hospital and Co.",
    );
    expect(rows.some((row) => row.label === "School Name")).toBe(false);
    expect(rows.find((row) => row.key === "beneficiaryCountryRegion")?.value).toBe(
      "United States & Canada",
    );
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
