"use client";

import { useMemo } from "react";
import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type PickupStationDetailsData,
} from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";

export interface PickupStationDetailsViewModel {
  id: string;
  stationName: string;
  stationCode: string;
  location: string;
  address: string;
  state: string;
  region: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  createdTime: string;
  status: string;
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
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

function normalizeStatus(value: PickupStationDetailsData): string {
  if (typeof value.isActive === "boolean") {
    return value.isActive ? "Active" : "Deactivated";
  }
  const status = value.status?.trim();
  if (!status) return "—";
  const normalized = status.toLowerCase().replace(/_/g, " ");
  if (normalized === "active") return "Active";
  if (normalized === "inactive" || normalized === "deactivated") {
    return "Deactivated";
  }
  return normalized
    .split(" ")
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function mapDetails(
  data: PickupStationDetailsData
): PickupStationDetailsViewModel {
  return {
    id: data.id,
    stationName: data.name || "—",
    stationCode: data.id || "—",
    location: [data.region, data.state].filter(Boolean).join(", ") || "—",
    address: data.address || "—",
    state: data.state || "—",
    region: data.region || "—",
    email: data.email || "—",
    phoneNumber: data.phoneNumber || "—",
    createdAt: formatDate(data.createdAt),
    createdTime: formatTime(data.createdAt),
    status: normalizeStatus(data),
  };
}

export function usePickupStationDetails(id?: string) {
  const query = useFetchSingleData<ApiResponse<PickupStationDetailsData>>(
    [...adminKeys.outlet.pickupStations.detail(id ?? "")],
    () => adminApi.outlet.pickupStations.getById(id!),
    Boolean(id)
  );

  const station = useMemo(() => {
    const data = query.data?.data;
    if (!data) return null;
    return mapDetails(data);
  }, [query.data?.data]);

  const isNotFound = !query.isLoading && !station;

  return {
    station,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    isNotFound,
    refetch: query.refetch,
  };
}
