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
import { mapCustomerBankAccountToUi } from "@/app/(customer)/_utils/customer-bank-accounts";
import type { BankAccount } from "@/app/(customer)/_components/transactions/forms/PickupPointStep";

export function useCustomerBankAccounts(enabled = true) {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useFetchData<CustomerBankAccountsListResponse>(
    [...customerKeys.bankAccounts.list()],
    () => customerApi.bankAccounts.list(),
    enabled,
  );

  const savedAccounts: CustomerBankAccount[] = data?.data ?? [];

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
    isSaving: createMutation.isPending,
    setDefaultAccount,
    isSettingDefault: setDefaultMutation.isPending,
    removeAccount,
    attachToTransaction,
  };
}
