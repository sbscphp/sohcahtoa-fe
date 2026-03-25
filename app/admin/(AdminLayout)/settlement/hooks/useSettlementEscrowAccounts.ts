"use client";

import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi } from "@/app/admin/_services/admin-api";

export interface SettlementEscrowAccountListItem {
  name: string;
  bank: string;
  number: string;
  isActive: boolean;
}

interface SettlementEscrowAccountsListResponse {
  data?: unknown;
  metadata?: unknown;
}

export function useSettlementEscrowAccounts() {
  const query = useFetchData<ApiResponse<SettlementEscrowAccountsListResponse>>(
    [...adminKeys.settlement.escrowAccounts()],
    () =>
      adminApi.settlement.listEscrowAccounts() as unknown as Promise<
        ApiResponse<SettlementEscrowAccountsListResponse>
      >,
    true
  );

  const accounts = extractEscrowAccounts(query.data?.data);

  return {
    accounts,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

function asString(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  return typeof value === "string" ? value : String(value);
}

function parseIsActive(raw: Record<string, unknown>): boolean {
  const activeCandidate = raw.isActive ?? raw.active ?? raw.status;

  if (typeof activeCandidate === "boolean") return activeCandidate;

  if (typeof activeCandidate === "string") {
    const s = activeCandidate.trim().toLowerCase();
    if (!s) return true;
    return s === "active" || s === "enabled" || s === "true";
  }

  // Best-guess fallback: if the backend doesn't send status, keep showing "Active"
  return true;
}

function parseEscrowAccount(raw: Record<string, unknown>): SettlementEscrowAccountListItem {
  const name =
    asString(raw.name) ||
    asString(raw.title) ||
    asString(raw.settlementName) ||
    asString(raw.accountName) ||
    "--";

  const bank =
    asString(raw.bank) ||
    asString(raw.bankName) ||
    asString(raw.financialInstitution) ||
    "--";

  const number =
    asString(raw.number) ||
    asString(raw.accountNumber) ||
    asString(raw.accountNo) ||
    asString(raw.account) ||
    "--";

  return {
    name,
    bank,
    number,
    isActive: parseIsActive(raw),
  };
}

function extractEscrowAccounts(data: unknown): SettlementEscrowAccountListItem[] {
  if (Array.isArray(data)) {
    return data
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null
      )
      .map(parseEscrowAccount);
  }

  if (!data || typeof data !== "object") return [];

  const obj = data as Record<string, unknown>;
  const candidates = [obj.items, obj.rows, obj.accounts, obj.escrows];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .filter(
          (item): item is Record<string, unknown> =>
            typeof item === "object" && item !== null
        )
        .map(parseEscrowAccount);
    }
  }

  return [];
}

