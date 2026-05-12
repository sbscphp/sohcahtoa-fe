import { describe, expect, it } from "vitest";
import { getVirtualAccountBankStepUiState } from "../virtualAccountBankStepUi";

const futureIso = () => new Date(Date.now() + 60 * 60 * 1000).toISOString();
const pastIso = () => new Date(Date.now() - 60 * 60 * 1000).toISOString();

const baseInput = {
  isBankTransfer: true as const,
  va: {
    isPending: false,
    isError: false,
    error: null,
    accountData: null as unknown,
  },
  liveRemainingSec: 600,
};

describe("getVirtualAccountBankStepUiState (customer)", () => {
  it("returns an inert state when not on bank transfer", () => {
    const ui = getVirtualAccountBankStepUiState({
      ...baseInput,
      isBankTransfer: false,
      va: { ...baseInput.va, isPending: true, isError: true },
    });
    expect(ui).toEqual({
      va404: false,
      vaInitialPending: false,
      renewalUx: false,
      activeVa: false,
      fatalLoadError: false,
      activeVaExpiringSoon: false,
    });
  });

  it("treats first VA fetch as pending skeleton", () => {
    const ui = getVirtualAccountBankStepUiState({
      ...baseInput,
      va: { ...baseInput.va, isPending: true },
    });
    expect(ui.vaInitialPending).toBe(true);
    expect(ui.renewalUx).toBe(false);
    expect(ui.activeVa).toBe(false);
    expect(ui.fatalLoadError).toBe(false);
  });

  it("treats a valid non-expired account as active", () => {
    const ui = getVirtualAccountBankStepUiState({
      ...baseInput,
      va: {
        ...baseInput.va,
        accountData: {
          accountNumber: "123",
          isExpired: false,
          expiresAt: futureIso(),
        },
      },
    });
    expect(ui.activeVa).toBe(true);
    expect(ui.renewalUx).toBe(false);
    expect(ui.fatalLoadError).toBe(false);
  });

  it("treats isExpired true as renewal", () => {
    const ui = getVirtualAccountBankStepUiState({
      ...baseInput,
      va: {
        ...baseInput.va,
        accountData: {
          accountNumber: "123",
          isExpired: true,
          expiresAt: futureIso(),
        },
      },
    });
    expect(ui.renewalUx).toBe(true);
    expect(ui.activeVa).toBe(false);
  });

  it("treats past expiresAt as renewal", () => {
    const ui = getVirtualAccountBankStepUiState({
      ...baseInput,
      va: {
        ...baseInput.va,
        accountData: {
          accountNumber: "123",
          isExpired: false,
          expiresAt: pastIso(),
        },
      },
    });
    expect(ui.renewalUx).toBe(true);
    expect(ui.activeVa).toBe(false);
  });

  it("treats 404 as renewal (generate path)", () => {
    const ui = getVirtualAccountBankStepUiState({
      ...baseInput,
      va: {
        ...baseInput.va,
        isError: true,
        error: { status: 404 },
        accountData: null,
      },
    });
    expect(ui.va404).toBe(true);
    expect(ui.renewalUx).toBe(true);
    expect(ui.fatalLoadError).toBe(false);
  });

  it("treats non-404 VA error as fatal", () => {
    const ui = getVirtualAccountBankStepUiState({
      ...baseInput,
      va: {
        ...baseInput.va,
        isError: true,
        error: { status: 500 },
        accountData: null,
      },
    });
    expect(ui.fatalLoadError).toBe(true);
    expect(ui.activeVa).toBe(false);
    expect(ui.renewalUx).toBe(false);
  });

  it("flags expiring soon only when VA is active", () => {
    const activeAccount = {
      accountNumber: "123",
      isExpired: false,
      expiresAt: futureIso(),
    };
    expect(
      getVirtualAccountBankStepUiState({
        ...baseInput,
        va: { ...baseInput.va, accountData: activeAccount },
        liveRemainingSec: 15,
      }).activeVaExpiringSoon
    ).toBe(true);

    expect(
      getVirtualAccountBankStepUiState({
        ...baseInput,
        va: { ...baseInput.va, accountData: activeAccount },
        liveRemainingSec: 120,
      }).activeVaExpiringSoon
    ).toBe(false);

    expect(
      getVirtualAccountBankStepUiState({
        ...baseInput,
        va: {
          ...baseInput.va,
          accountData: { ...activeAccount, isExpired: true },
        },
        liveRemainingSec: 10,
      }).activeVaExpiringSoon
    ).toBe(false);
  });
});
