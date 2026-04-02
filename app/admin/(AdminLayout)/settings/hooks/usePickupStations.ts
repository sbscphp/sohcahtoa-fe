"use client";

import { useMemo } from "react";
import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import type { ApiResponse } from "@/app/_lib/api/client";
import {
  adminApi,
  type PickupStationListItemData,
  type PickupStationListParams,
} from "@/app/admin/_services/admin-api";

export interface PickupStationRowItem {
  id: string;
  stationName: string;
  stationId: string;
  location: string;
  address: string;
  state: string;
  region: string;
  email: string;
  phoneNumber: string;
  dateCreated: string;
  timeCreated: string;
}

type PickupStationsListResponse = Omit<
  ApiResponse<PickupStationListItemData[]>,
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

function mapPickupStation(item: PickupStationListItemData): PickupStationRowItem {
  return {
    id: item.id,
    stationName: item.stationName || "—",
    stationId: item.id || "—",
    location: [item.region, item.state].filter(Boolean).join(", ") || "—",
    address: item.physicalAddress || "—",
    state: item.state || "—",
    region: item.region || "—",
    email: item.stationEmail || "—",
    phoneNumber: item.phoneNumber || "—",
    dateCreated: formatDate(item.createdAt),
    timeCreated: formatTime(item.createdAt),
  };
}

export function usePickupStations(params: PickupStationListParams = {}) {
  const query = useFetchDataSeperateLoading<PickupStationsListResponse>(
    [...adminKeys.outlet.pickupStations.list(params)],
    () =>
      adminApi.outlet.pickupStations.list(
        params
      ) as unknown as Promise<PickupStationsListResponse>,
    true
  );

  const rows = useMemo(
    () =>
      Array.isArray(query.data?.data) ? query.data.data.map(mapPickupStation) : [],
    [query.data]
  );
  const pagination = query.data?.metadata?.pagination;

  return {
    stations: rows,
    total: pagination?.total ?? rows.length,
    page: pagination?.page ?? params.page ?? 1,
    totalPages: pagination?.totalPages ?? 1,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
