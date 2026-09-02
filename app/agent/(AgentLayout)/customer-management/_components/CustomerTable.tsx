"use client";

import { useMemo } from "react";
import { Badge, Text } from "@mantine/core";
import SearchInput from "@/app/admin/_components/SearchInput";
import { ActionButton } from "@/app/admin/_components/ActionButton";
import {
  TableWrapper,
  type PaginatedTableColumn,
} from "@/app/agent/_components/common";
import type {
  TableFilterValues,
} from "@/app/(customer)/_components/common/table/TableFilterSheet";
import type { AgentCustomerSummary } from "@/app/_lib/api/types";
import { getTransactionTypeLabel } from "@/app/(customer)/_lib/mock-transactions";
import { formatLocalDate, formatShortTime } from "@/app/utils/helper/formatLocalDate";
import { useRouter } from "next/navigation";
import {
  AGENT_CUSTOMER_FILTER_OPTIONS,
} from "../constant";

interface CustomerTableProps {
  customers?: AgentCustomerSummary[];
  loading?: boolean;
  page: number;
  totalPages: number;
  search: string;
  filterValues: TableFilterValues;
  onSearchChange: (value: string) => void;
  onFiltersApply: (values: TableFilterValues) => void;
  onPageChange: (page: number) => void;
  onExportClick?: () => void;
}

function mapCustomerTypeLabel(customerType: string): string {
  if (customerType === "NIGERIAN_CITIZEN") return "Resident";
  if (customerType === "EXPATRIATE") return "Expatriate";
  if (customerType === "TOURIST") return "Tourist";
  return customerType || "—";
}

function mapKycStatusLabel(status: string): string {
  const normalized = status?.toUpperCase?.() ?? "";
  switch (normalized) {
    case "VERIFIED":
    case "APPROVED":
      return "Verified";
    case "REJECTED":
      return "Rejected";
    case "IN_PROGRESS":
      return "In progress";
    case "PENDING_VERIFICATION":
      return "Pending verification";
    case "NOT_STARTED":
      return "Not started";
    default:
      return status || "—";
  }
}

function getKYCStatusColor(status: string): string {
  const label = mapKycStatusLabel(status).toLowerCase();
  if (label === "verified") return "green";
  if (label === "rejected") return "red";
  if (label.includes("pending") || label.includes("progress")) return "orange";
  return "gray";
}

export default function CustomerTable({
  customers = [],
  loading = false,
  page,
  totalPages,
  search,
  filterValues,
  onSearchChange,
  onFiltersApply,
  onPageChange,
  onExportClick,
}: Readonly<CustomerTableProps>) {
  const router = useRouter();

  const columns: PaginatedTableColumn<AgentCustomerSummary>[] = useMemo(
    () => [
      {
        key: "customerName",
        label: "Customer Name",
        render: (item) => (
          <div>
            <Text fw={500} size="sm">
              {item.fullName}
            </Text>
            <Text size="xs" c="dimmed">
              ID: {item.userId}
            </Text>
          </div>
        ),
      },
      {
        key: "customerType",
        label: "Customer Type",
        render: (item) => (
          <Text size="sm">{mapCustomerTypeLabel(item.customerType)}</Text>
        ),
      },
      {
        key: "lastTransactionType",
        label: "Last Transaction Type",
        render: (item) => (
          <Text size="sm">
            {item.lastTransactionType
              ? getTransactionTypeLabel(item.lastTransactionType)
              : "—"}
          </Text>
        ),
      },
      {
        key: "dateRegistered",
        label: "Date Registered",
        render: (item) => (
          <div>
            <p className="text-body-text-300 text-sm leading-5">
              {formatLocalDate(item.registeredAt || "")}
            </p>
            <p className="text-body-text-200 text-xs leading-5">
              {formatShortTime(item.registeredAt || "")}
            </p>
          </div>
        ),
      },
      {
        key: "kycStatus",
        label: "KYC Status",
        render: (item) => (
          <Badge color={getKYCStatusColor(item.kycStatus)} variant="light" size="sm">
            {mapKycStatusLabel(item.kycStatus)}
          </Badge>
        ),
      },
      {
        key: "action",
        label: "Action",
        render: (item) => (
          <ActionButton
            onClick={() => router.push(`/agent/customer-management/${item.userId}`)}
            aria-label="View customer details"
          />
        ),
      },
    ],
    [router]
  );

  return (
    <div className="my-5 rounded-lg bg-white p-5">
      <TableWrapper
        title="All Customers"
        filters={AGENT_CUSTOMER_FILTER_OPTIONS}
        filterValues={filterValues}
        onFiltersApply={onFiltersApply}
        filterSheetTitle="Filter Customers"
        onExportClick={onExportClick}
        toolbarBelowFilters={
          <SearchInput
            placeholder="Search by name, email, phone, or ID"
            value={search}
            onChange={(e) => onSearchChange(e.currentTarget.value)}
          />
        }
        data={customers}
        columns={columns}
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        pageSize={10}
        keyExtractor={(item) => item.userId}
        emptyTitle="No Customers Found"
        emptyMessage="There are currently no customers to display."
        isLoading={loading}
        onRowClick={(item) =>
          router.push(`/agent/customer-management/${item.userId}`)
        }
      />
    </div>
  );
}
