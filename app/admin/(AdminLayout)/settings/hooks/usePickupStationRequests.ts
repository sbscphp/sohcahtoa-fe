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

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function normalizeStatus(raw?: string): StationPickupStatus {
  if (!raw?.trim()) return "Pending";
  const lower = raw.toLowerCase();
  if (lower.includes("picked")) return "Picked Up";
  if (lower.includes("pending")) return "Pending";
  return "Pending";
}

function mapRequest(item: PickupStationRequestListItemData): StationPickup {
  const created = item.createdAt;
  return {
    id: item.id ?? "—",
    customerName: item.customerName ?? "—",
    customerCode: item.customerCode ?? item.id ?? "—",
    phoneNumber: item.phoneNumber ?? "—",
    email: item.email ?? "—",
    date: item.date ?? (created ? formatDate(created) : "—"),
    time: item.time ?? (created ? formatTime(created) : "—"),
    type: item.type ?? "—",
    status: normalizeStatus(item.status),
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
