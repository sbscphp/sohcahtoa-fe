import {
  isVirtualAccountExpiringSoon,
  isVirtualAccountWindowExpired,
} from "@/app/(customer)/_utils/transaction-payment";

export type VirtualAccountBankStepUiInput = {
  isBankTransfer: boolean;
  va: {
    isPending: boolean;
    isError: boolean;
    error: unknown;
    accountData: unknown;
  };
  liveRemainingSec: number;
};

export type VirtualAccountBankStepUiState = {
  va404: boolean;
  vaInitialPending: boolean;
  renewalUx: boolean;
  activeVa: boolean;
  fatalLoadError: boolean;
  activeVaExpiringSoon: boolean;
};

function isVa404(error: unknown): boolean {
  return (error as { status?: number } | null)?.status === 404;
}

/** Agent: bank-step UI flags from React Query + virtual-account payload. */
export function getVirtualAccountBankStepUiState(
  input: VirtualAccountBankStepUiInput
): VirtualAccountBankStepUiState {
  const { isBankTransfer, va, liveRemainingSec } = input;

  if (!isBankTransfer) {
    return {
      va404: false,
      vaInitialPending: false,
      renewalUx: false,
      activeVa: false,
      fatalLoadError: false,
      activeVaExpiringSoon: false,
    };
  }

  const va404 = isVa404(va.error);
  const vaInitialPending = va.isPending;
  const renewalUx =
    !vaInitialPending && (isVirtualAccountWindowExpired(va.accountData) || va404);
  const activeVa = !vaInitialPending && !renewalUx && !va.isError;
  const fatalLoadError = !vaInitialPending && va.isError && !va404;
  const activeVaExpiringSoon =
    activeVa && isVirtualAccountExpiringSoon(liveRemainingSec, false);

  return {
    va404,
    vaInitialPending,
    renewalUx,
    activeVa,
    fatalLoadError,
    activeVaExpiringSoon,
  };
}
