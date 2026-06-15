"use client";

import { useMemo } from "react";
import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import type { ApiResponse } from "@/app/_lib/api/client";
import {
  adminApi,
  type PickupStationRequestListItemData,
  type PickupStationRequestListParams,
} from "@/app/admin/_services/admin-api";

export type StationPickupStatus = "Picked Up" | "Pending";

export type StationPickup = {
  id: string;
  customerName: string;
  customerCode: string;
  phoneNumber: string;
  email: string;
  date: string;
  time: string;
  type: string;
  status: StationPickupStatus;
};

type PickupStationRequestsListResponse = Omit<
  ApiResponse<PickupStationRequestListItemData[]>,
  "metadata"
> & {
  metadata?: {
    pagination?: {
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };
  } | null;
};

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  PTA: "PTA",
  BTA: "BTA",
  SCHOOL_FEES: "School Fees",
  MEDICAL: "Medical",
  PROFESSIONAL_BODY: "Professional Body",
  TOURIST_FX: "Tourist FX",
  RESIDENT_FX: "Resident FX",
  EXPATRIATE_FX: "Expatriate FX",
  IMTO_REMITTANCE: "IMTO Remittance",
  CASH_REMITTANCE: "Cash Remittance",
};

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeFromIso(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatScheduledTime(value?: string | null): string {
  if (!value?.trim()) return "—";
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return value;

  const hours = Number.parseInt(match[1], 10);
  const minutes = match[2];
  if (Number.isNaN(hours)) return value;

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
}

function formatTransactionType(type?: string | null): string {
  if (!type?.trim()) return "—";
  return TRANSACTION_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}

export function mapPickupStatusFilterToApi(
  value: string
): string | undefined {
  if (value === "Filter By" || value === "All") return undefined;
  if (value === "Pending") return "PENDING";
  if (value === "Picked Up") return "PICKED_UP";
  return undefined;
}

function normalizeStatus(
  raw?: string,
  pickedUpAt?: string | null
): StationPickupStatus {
  if (pickedUpAt) return "Picked Up";
  if (!raw?.trim()) return "Pending";

  const normalized = raw.trim().toLowerCase().replace(/_/g, " ");
  if (normalized.includes("picked")) return "Picked Up";
  if (normalized.includes("pending")) return "Pending";
  return "Pending";
}

function mapRequest(item: PickupStationRequestListItemData): StationPickup {
  const hasScheduledDate = Boolean(item.scheduledPickupDate);
  const hasScheduledTime = Boolean(item.scheduledPickupTime?.trim());

  return {
    id: item.requestId ?? "—",
    customerName: item.customer?.name ?? "—",
    customerCode: item.customer?.id ?? "—",
    phoneNumber: item.customer?.phoneNumber ?? "—",
    email: item.customer?.email ?? "—",
    date: hasScheduledDate
      ? formatDate(item.scheduledPickupDate)
      : formatDate(item.createdAt),
    time: hasScheduledTime
      ? formatScheduledTime(item.scheduledPickupTime)
      : formatTimeFromIso(item.createdAt),
    type: formatTransactionType(item.transaction?.type),
    status: normalizeStatus(item.status, item.pickedUpAt),
  };
}

export function usePickupStationRequests(
  stationId: string | undefined,
  params: PickupStationRequestListParams
) {
  const query = useFetchDataSeperateLoading<PickupStationRequestsListResponse>(
    [...adminKeys.outlet.pickupStations.requests(stationId ?? "", params)],
    () =>
      adminApi.outlet.pickupStations.requests(
        stationId!,
        params
      ) as unknown as Promise<PickupStationRequestsListResponse>,
    Boolean(stationId)
  );

  const pickups = useMemo(
    () =>
      Array.isArray(query.data?.data) ? query.data.data.map(mapRequest) : [],
    [query.data]
  );

  const pagination = query.data?.metadata?.pagination;

  return {
    pickups,
    total: pagination?.total ?? pickups.length,
    page: pagination?.page ?? params.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
