"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateData, useFetchData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import type {
  CreateCustomerBankAccountRequest,
  CustomerBankAccount,
  CustomerBankAccountsListResponse,
} from "@/app/_lib/api/types";
import { agentApi } from "@/app/agent/_services/agent-api";
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

export interface UseAgentBankAccountsOptions {
  customerId: string;
  /** `LOCAL` = NGN accounts; FX code (e.g. USD) = domiciliary accounts for that currency. */
  currency?: BankAccountListFilter;
  enabled?: boolean;
}

export function useAgentBankAccounts(options: UseAgentBankAccountsOptions) {
  const customerId = options.customerId.trim();
  const currency = options.currency;
  const enabled = (options.enabled ?? true) && Boolean(customerId);
  const queryClient = useQueryClient();
  const listParams = toBankAccountListParams(currency);

  const { data, isLoading, refetch } = useFetchData<CustomerBankAccountsListResponse>(
    customerId
      ? [...agentKeys.customers.bankAccounts.list(customerId, currency)]
      : [],
    () => agentApi.customers.bankAccounts.list(customerId, listParams),
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

  const createMutation = useCreateData(
    (payload: CreateCustomerBankAccountRequest) =>
      agentApi.customers.bankAccounts.create(customerId, payload),
  );
  const setDefaultMutation = useCreateData((bankAccountId: string) =>
    agentApi.customers.bankAccounts.setDefault(customerId, bankAccountId),
  );

  const invalidate = async () => {
    if (!customerId) return;
    await queryClient.invalidateQueries({
      queryKey: agentKeys.customers.bankAccounts.all(customerId),
    });
  };

  const addAccount = async (payload: CreateCustomerBankAccountRequest) => {
    if (!customerId) {
      throw new Error("Select a customer before adding a bank account.");
    }
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
    if (!customerId) {
      throw new Error("Select a customer before adding a domiciliary account.");
    }
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
    if (!customerId) {
      throw new Error("Select a customer before updating the default bank account.");
    }
    await setDefaultMutation.mutateAsync(bankAccountId);
    await invalidate();
  };

  const removeAccount = async (bankAccountId: string) => {
    if (!customerId) {
      throw new Error("Select a customer before removing a bank account.");
    }
    await agentApi.customers.bankAccounts.remove(customerId, bankAccountId);
    await invalidate();
  };

  const attachToTransaction = async (transactionId: string, bankAccountIds: string[]) => {
    if (!bankAccountIds.length) return;
    await agentApi.transactions.attachBankAccounts(transactionId, {
      bankAccountIds,
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
export function useLocalBankAccounts(customerId: string, enabled = true) {
  return useAgentBankAccounts({ customerId, currency: "LOCAL", enabled });
}

/** Domiciliary bank accounts for a selected FX currency (e.g. USD). */
export function useDomiciliaryBankAccounts(
  customerId: string,
  selectedCurrency: string,
  enabled = true,
) {
  const currency = selectedCurrency.trim().toUpperCase() || "USD";
  const result = useAgentBankAccounts({ customerId, currency, enabled });

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
