"use client";

import { useMemo } from "react";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type TicketDetailsResponseData,
  type TicketAttachment,
  type TicketStatusCode,
} from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";

export interface TicketDetailsViewModel {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhoneNumber: string;
  caseType: string;
  description: string;
  priorityLabel: string;
  statusCode: TicketStatusCode | null;
  statusLabel: string;
  createdDate: string;
  createdTime: string;
  attachments: TicketAttachment[];
  firstAttachment: TicketAttachment | null;
}

function toDisplayLabel(value: string): string {
  if (!value) return "--";

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatDateTime(value: string) {
  if (!value) {
    return { createdDate: "--", createdTime: "--" };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { createdDate: "--", createdTime: "--" };
  }

  return {
    createdDate: parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    createdTime: parsed.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

function toViewModel(data: TicketDetailsResponseData | null): TicketDetailsViewModel | null {
  if (!data) return null;

  const { createdDate, createdTime } = formatDateTime(data.createdAt);
  const attachments = Array.isArray(data.attachments) ? data.attachments : [];
  const customerName = data.customer?.fullName || data.customerName || "--";
  const customerEmail = data.customer?.email || data.customerEmail || "--";
  const customerPhoneNumber =
    data.customer?.phoneNumber || data.customerPhoneNumber || "--";

  return {
    id: data.id || "--",
    reference: data.reference || data.id || "--",
    customerName,
    customerEmail,
    customerPhoneNumber,
    caseType: data.caseType || "--",
    description: data.description || "--",
    priorityLabel: toDisplayLabel(data.priority),
    statusCode:
      data.status === "OPEN" ||
      data.status === "IN_PROGRESS" ||
      data.status === "RESOLVED" ||
      data.status === "REOPENED" ||
      data.status === "CLOSED"
        ? data.status
        : null,
    statusLabel: toDisplayLabel(data.status),
    createdDate,
    createdTime,
    attachments,
    firstAttachment: attachments[0] ?? null,
  };
}

export function useTicketDetails(ticketId?: string) {
  const query = useFetchData<ApiResponse<TicketDetailsResponseData>>(
    [...adminKeys.tickets.detail(ticketId ?? "")],
    () =>
      adminApi.tickets.getById(ticketId ?? "") as unknown as Promise<
        ApiResponse<TicketDetailsResponseData>
      >,
    Boolean(ticketId)
  );

  const ticket = useMemo(() => toViewModel(query.data?.data ?? null), [query.data?.data]);

  return {
    ticket,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
