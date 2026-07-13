"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateData, useFetchData } from "@/app/_lib/api/hooks";
import { customerKeys } from "@/app/_lib/api/query-keys";
import type {
  CreateCustomerBankAccountRequest,
  CustomerBankAccount,
  CustomerBankAccountsListResponse,
} from "@/app/_lib/api/types";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import type { DomiciliaryAccountFormData } from "@/app/(customer)/_lib/domiciliary-account-schema";
import type { DomiciliaryRefundAccount } from "@/app/(customer)/_components/transactions/forms/sell-fx/DomiciliaryRefundBankStep";
import {
  type BankAccountListFilter,
  filterAccountsByCurrency,
  mapCustomerBankAccountToDomiciliaryRefund,
  mapCustomerBankAccountToUi,
  toBankAccountListParams,
  toCreateDomiciliaryBankAccountPayload,
} from "@/app/(customer)/_utils/customer-bank-accounts";
import type { BankAccount } from "@/app/(customer)/_components/transactions/forms/PickupPointStep";

export interface UseCustomerBankAccountsOptions {
  /** `LOCAL` = NGN accounts; FX code (e.g. USD) = domiciliary accounts for that currency. */
  currency?: BankAccountListFilter;
  enabled?: boolean;
}

function listQueryKey(currency?: BankAccountListFilter) {
  return [...customerKeys.bankAccounts.list(currency)];
}

export function useCustomerBankAccounts(options?: UseCustomerBankAccountsOptions) {
  const currency = options?.currency;
  const enabled = options?.enabled ?? true;
  const queryClient = useQueryClient();
  const listParams = toBankAccountListParams(currency);

  const { data, isLoading, refetch } = useFetchData<CustomerBankAccountsListResponse>(
    listQueryKey(currency),
    () => customerApi.bankAccounts.list(listParams),
    enabled,
  );

  const savedAccounts: CustomerBankAccount[] = useMemo(() => {
    const raw = data?.data ?? [];
    return currency ? filterAccountsByCurrency(raw, currency) : raw;
  }, [currency, data?.data]);

  const accounts: BankAccount[] = useMemo(
    () => savedAccounts.map((account) => mapCustomerBankAccountToUi(account)),
    [savedAccounts],
  );

  const createMutation = useCreateData(customerApi.bankAccounts.create);
  const setDefaultMutation = useCreateData(
    (bankAccountId: string) => customerApi.bankAccounts.setDefault(bankAccountId),
  );

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: customerKeys.bankAccounts.all });
  };

  const addAccount = async (payload: CreateCustomerBankAccountRequest) => {
    const response = await createMutation.mutateAsync(payload);
    const saved = response.data;
    if (!saved) {
      throw new Error("Bank account was not returned after save.");
    }
    await invalidate();
    return mapCustomerBankAccountToUi(saved);
  };

  const addDomiciliaryAccount = async (
    formData: DomiciliaryAccountFormData,
    accountCurrency: string,
  ): Promise<DomiciliaryRefundAccount> => {
    const response = await createMutation.mutateAsync(
      toCreateDomiciliaryBankAccountPayload(formData, accountCurrency),
    );
    const saved = response.data;
    if (!saved) {
      throw new Error("Domiciliary bank account was not returned after save.");
    }
    await invalidate();
    return mapCustomerBankAccountToDomiciliaryRefund(saved, formData);
  };

  const setDefaultAccount = async (bankAccountId: string) => {
    await setDefaultMutation.mutateAsync(bankAccountId);
    await invalidate();
  };

  const removeAccount = async (bankAccountId: string) => {
    await customerApi.bankAccounts.remove(bankAccountId);
    await invalidate();
  };

  const attachToTransaction = async (transactionId: string, bankAccountIds: string[]) => {
    if (!bankAccountIds.length) return;
    await customerApi.bankAccounts.attachToTransaction(transactionId, {
      bankAccountIds,
    });
    await queryClient.invalidateQueries({
      queryKey: customerKeys.bankAccounts.forTransaction(transactionId),
    });
  };

  return {
    savedAccounts,
    accounts,
    isLoading,
    refetch,
    addAccount,
    addDomiciliaryAccount,
    isSaving: createMutation.isPending,
    setDefaultAccount,
    isSettingDefault: setDefaultMutation.isPending,
    removeAccount,
    attachToTransaction,
    invalidate,
  };
}

/** Local NGN bank accounts for refunds and electronic payouts. */
export function useLocalBankAccounts(enabled = true) {
  return useCustomerBankAccounts({ currency: "LOCAL", enabled });
}

/** Domiciliary bank accounts for a selected FX currency (e.g. USD). */
export function useDomiciliaryBankAccounts(
  selectedCurrency: string,
  enabled = true,
) {
  const currency = selectedCurrency.trim().toUpperCase() || "USD";
  const result = useCustomerBankAccounts({ currency, enabled });

  const domiciliaryAccounts: DomiciliaryRefundAccount[] = useMemo(
    () =>
      result.savedAccounts.map((account) => mapCustomerBankAccountToDomiciliaryRefund(account)),
    [result.savedAccounts],
  );

  return {
    ...result,
    currency,
    domiciliaryAccounts,
    selectableDomiciliaryAccounts: domiciliaryAccounts,
  };
}
