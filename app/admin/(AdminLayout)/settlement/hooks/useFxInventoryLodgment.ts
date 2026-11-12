"use client";

import { useMemo } from "react";
import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type FxInventoryLodgmentStatus,
} from "@/app/admin/_services/admin-api";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";

const STATUS_LABELS: Record<FxInventoryLodgmentStatus, string> = {
  PENDING_VERIFICATION: "Pending",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
};

export interface FxInventoryLodgmentDetailView {
  id: string;
  reference: string;
  agentName: string;
  agentId: string;
  recordedDate: string;
  recordedTime: string;
  currency: string;
  statedAmount: number | null;
  confirmedAmount: number | null;
  returnedAmountLabel: string;
  updatedAmountLabel: string;
  varianceLabel: string;
  status: string;
  rawStatus: string;
  updatedBy: string;
  dateConfirmed: string;
  timeConfirmed: string;
}

interface LodgmentDetailResponse {
  data?: unknown;
}

function asString(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  return typeof value === "string" ? value : String(value);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function toAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatAmount(amount: number | null, currency: string): string {
  if (amount === null) return "-";
  return formatCurrency(amount, currency || "NGN") || "-";
}

function formatDateTime(iso: string): { date: string; time: string } {
  if (!iso) return { date: "-", time: "-" };

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return { date: "-", time: "-" };

  return {
    date: parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: parsed.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

function statusLabel(status: string): string {
  const normalized = status.trim().toUpperCase() as FxInventoryLodgmentStatus;
  return STATUS_LABELS[normalized] ?? (status.trim() || "--");
}

function parseDetail(data: unknown): FxInventoryLodgmentDetailView | null {
  const raw = asRecord(data);
  if (!raw) return null;

  const id = asString(raw.id);
  if (!id) return null;

  const agent = asRecord(raw.agent);
  const currency = asString(raw.currency, "NGN");
  const statedAmount = toAmount(raw.statedAmount);
  const confirmedAmount = toAmount(raw.confirmedAmount);
  const varianceAmount = toAmount(raw.varianceAmount);
  const lodged = formatDateTime(asString(raw.submittedAt));
  const confirmed = formatDateTime(
    asString(raw.confirmedAt) || asString(raw.rejectedAt)
  );
  const updatedBy =
    asString(raw.confirmedByName).trim() || asString(raw.rejectedByName).trim() || "-";

  return {
    id,
    reference: asString(raw.referenceNumber, "--"),
    agentName: asString(agent?.name, "--"),
    agentId: asString(agent?.id, "--"),
    recordedDate: lodged.date,
    recordedTime: lodged.time,
    currency,
    statedAmount,
    confirmedAmount,
    returnedAmountLabel: formatAmount(statedAmount, currency),
    updatedAmountLabel: formatAmount(confirmedAmount, currency),
    varianceLabel: formatAmount(varianceAmount, currency),
    status: statusLabel(asString(raw.status)),
    rawStatus: asString(raw.status).trim().toUpperCase(),
    updatedBy,
    dateConfirmed: asString(raw.confirmedAt) || asString(raw.rejectedAt) ? confirmed.date : "-",
    timeConfirmed: asString(raw.confirmedAt) || asString(raw.rejectedAt) ? confirmed.time : "-",
  };
}

export function useFxInventoryLodgment(id?: string) {
  const query = useFetchSingleData<LodgmentDetailResponse>(
    [...adminKeys.fxInventory.lodgment(id ?? "")],
    () => adminApi.fxInventory.getLodgment(id ?? "") as unknown as Promise<LodgmentDetailResponse>,
    Boolean(id)
  );

  const detail = useMemo(() => parseDetail(query.data?.data), [query.data?.data]);

  return {
    detail,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
