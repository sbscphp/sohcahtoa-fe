import {
  filterAccountsByCurrency,
  isDomiciliaryBankAccount,
  isLocalBankAccount,
  mapCustomerBankAccountToDomiciliaryRefund,
  toBankAccountListParams,
  toCreateDomiciliaryBankAccountPayload,
} from "../customer-bank-accounts";
import type { CustomerBankAccount } from "@/app/_lib/api/types";

const localAccount: CustomerBankAccount = {
  id: "local-1",
  bankName: "GTBank",
  accountNumber: "0123456789",
  accountName: "Local User",
  currency: null,
  isVerified: true,
  isDefault: false,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const domiciliaryAccount: CustomerBankAccount = {
  id: "usd-1",
  bankName: "Citibank",
  accountNumber: "1234567890",
  accountName: "FX User",
  currency: "USD",
  swiftCode: "CITIUS33",
  routingNumber: "021000089",
  bankAddress: "388 Greenwich St",
  isVerified: true,
  isDefault: false,
  createdAt: "2026-01-01T00:00:00.000Z",
};

const legacyForeignAccount: CustomerBankAccount = {
  ...domiciliaryAccount,
  id: "foreign-1",
  currency: "FOREIGN",
};

describe("bank account currency helpers", () => {
  it("maps list filters to API params", () => {
    expect(toBankAccountListParams("USD")).toEqual({ currency: "USD" });
    expect(toBankAccountListParams("LOCAL")).toEqual({ currency: "NGN" });
    expect(toBankAccountListParams(undefined)).toBeUndefined();
  });

  it("classifies local and domiciliary accounts", () => {
    expect(isLocalBankAccount(localAccount)).toBe(true);
    expect(isDomiciliaryBankAccount(localAccount)).toBe(false);
    expect(isDomiciliaryBankAccount(domiciliaryAccount)).toBe(true);
  });

  it("filters mixed account lists client-side by selected currency", () => {
    const mixed = [localAccount, domiciliaryAccount, legacyForeignAccount];
    expect(filterAccountsByCurrency(mixed, "LOCAL")).toEqual([localAccount]);
    expect(filterAccountsByCurrency(mixed, "USD")).toEqual([
      domiciliaryAccount,
      legacyForeignAccount,
    ]);
    expect(filterAccountsByCurrency(mixed, "EUR")).toEqual([legacyForeignAccount]);
  });
});

describe("domiciliary account mapping", () => {
  it("builds create payload with selected FX currency", () => {
    expect(
      toCreateDomiciliaryBankAccountPayload(
        {
          domiciliaryAccountNumber: "1234567890",
          domiciliaryBankName: "Citibank",
          accountName: "FX User",
          swiftCode: "CITIUS33",
          routingNumber: "021000089",
          bankAddress: "388 Greenwich St",
        },
        "usd",
      ),
    ).toEqual({
      bankName: "Citibank",
      accountNumber: "1234567890",
      accountName: "FX User",
      currency: "USD",
      swiftCode: "CITIUS33",
      routingNumber: "021000089",
      bankAddress: "388 Greenwich St",
    });
  });

  it("maps API account to refund account using stored extras", () => {
    const mapped = mapCustomerBankAccountToDomiciliaryRefund(domiciliaryAccount);
    expect(mapped.id).toBe("usd-1");
    expect(mapped.domiciliaryBankName).toBe("Citibank");
    expect(mapped.domiciliaryAccountNumber).toBe("1234567890");
    expect(mapped.accountName).toBe("FX User");
    expect(mapped.swiftCode).toBe("CITIUS33");
  });

  it("prefers form extras when API omits extended fields", () => {
    const mapped = mapCustomerBankAccountToDomiciliaryRefund(localAccount, {
      swiftCode: "ABCDUS33",
      routingNumber: "111111111",
      bankAddress: "1 Main St",
    });
    expect(mapped.swiftCode).toBe("ABCDUS33");
    expect(mapped.routingNumber).toBe("111111111");
    expect(mapped.bankAddress).toBe("1 Main St");
  });
});
