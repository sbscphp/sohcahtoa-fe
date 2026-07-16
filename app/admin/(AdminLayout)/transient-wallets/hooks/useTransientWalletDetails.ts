"use client";

import { useMemo } from "react";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type AdminWalletDetail,
} from "@/app/admin/_services/admin-api";
import { formatCreatedAt } from "./walletUtils";

export interface TransientWalletDetail {
  id: string;
  walletId: string;
  customerId: string;
  customerName: string;
  balance: number;
  currency: string;
  totalDebit: number;
  totalCredit: number;
  dateCreated: string;
  timeCreated: string;
}

function mapWalletDetail(item: AdminWalletDetail): TransientWalletDetail {
  const { dateCreated, timeCreated } = formatCreatedAt(item.createdAt);
  return {
    id: item.id,
    walletId: item.walletId,
    customerId: item.customerId ?? item.userId,
    customerName: item.customerName,
    balance: item.balance,
    currency: item.currency,
    totalDebit: item.totalDebits,
    totalCredit: item.totalCredits,
    dateCreated,
    timeCreated,
  };
}

export function useTransientWalletDetails(walletId: string) {
  const query = useFetchData(
    [...adminKeys.wallet.detail(walletId)],
    () => adminApi.wallet.getById(walletId),
    Boolean(walletId)
  );

  const wallet = useMemo(() => {
    const data = query.data?.data;
    if (!data) return null;
    return mapWalletDetail(data);
  }, [query.data?.data]);

  return {
    wallet,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError || (!query.isLoading && !wallet),
    error: query.error,
  };
}
