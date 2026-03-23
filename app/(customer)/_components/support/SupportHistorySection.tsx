"use client";

import { useRouter } from "next/navigation";
import {
  PaginatedTable,
  type PaginatedTableColumn
} from "@/app/(customer)/_components/common";
import { getStatusBadge } from "@/app/(customer)/_utils/status-badge";
import { ActionIcon } from "@mantine/core";
import { IconArrowRight } from "@/components/icons/IconArrowRight";
import { useFetchData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { customerKeys } from "@/app/_lib/api/query-keys";
import type { SupportTicket, SupportTicketListResponse } from "@/app/_lib/api/types";
import { formatHeaderDateTime } from "@/app/utils/helper/formatLocalDate";
import { useTableState } from "@/app/_hooks/use-table-state";

export interface SupportRequestRow {
  id: string;
  categoryDescription: string;
  date: string;
  status: string;
}

function getCategoryLabel(category: string): string {
  const match = [
    { value: "TRANSACTION_ISSUE", label: "Transaction issue" },
    { value: "ACCOUNT_ACCESS", label: "Account access" },
    { value: "PAYMENT_ISSUE", label: "Payment issue" },
    { value: "DOCUMENT_VERIFICATION", label: "Document verification" },
    { value: "TECHNICAL_ISSUE", label: "Technical issue" },
    { value: "COMPLIANCE_INQUIRY", label: "Compliance / regulatory inquiry" },
    { value: "GENERAL_INQUIRY", label: "General inquiry" },
    { value: "OTHER", label: "Other" },
  ].find((opt) => opt.value === category);
  return match?.label ?? category;
}

export default function SupportHistorySection() {
  const router = useRouter();

  const table = useTableState({
    initial: { page: 1, limit: 10 },
  });

  const listParams = {
    page: table.page ?? 1,
    limit: table.limit ?? 10,
  };

  const { data, isLoading } = useFetchData(
    [...customerKeys.support.tickets.list(listParams)],
    () => customerApi.support.tickets.list(listParams),
    true
  );

  const typed = data as unknown as SupportTicketListResponse | undefined;

  const rows: SupportRequestRow[] =
    typed?.data?.map((t: SupportTicket) => ({
      id: t.id,
      categoryDescription: getCategoryLabel(t.category),
      date: formatHeaderDateTime(t.createdAt) || t.createdAt,
      status: t.status,
    })) ?? [];

  const goToViewSupport = (id: string) => {
    router.push(`/support/history/${id}`);
  };

  const columns: PaginatedTableColumn<SupportRequestRow>[] = [
    {
      key: "categoryDescription",
      label: "Category",
      headerClassName: "!max-w-[200px]",
      className: "!max-w-[200px]",
      render: (row) => (
        <div className="flex flex-col gap-0.5 min-w-0 max-w-[200px]">
          <span
            className="font-semibold text-[#4D4B4B] text-sm leading-5 truncate"
            title={row.categoryDescription}
          >
            {row.categoryDescription}
          </span>
          <span className="text-[#6C6969] text-sm font-normal leading-5">
            {row.date}
          </span>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (row) => (
        <div style={getStatusBadge(row.status)}>{row.status}</div>
      )
    },
    {
      key: "view",
      label: "View",
      align: "right",
      render: (row) => (
        <ActionIcon
          radius="md"
          variant="light"
          w={40}
          h={40}
          className="bg-[#FFF6F1]! border border-[#FFF6F1]!"
          style={{
            boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
            padding: "10px"
          }}
          onClick={(e) => {
            e.stopPropagation();
            goToViewSupport(row.id);
          }}
          aria-label="View transaction details"
        >
          <IconArrowRight className="w-8 h-8 "/>
        </ActionIcon>
      )
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 w-full">
      <div className="space-y-2 mb-6">
        <h2 className="text-body-heading-300 text-xl md:text-2xl font-bold">
          Support
        </h2>
        <p className="text-body-text-200 text-sm md:text-base">
          View and track the status of your past support request.
        </p>
      </div>
      <PaginatedTable<SupportRequestRow>
        data={rows}
        columns={columns}
        isLoading={isLoading}
        pageSize={listParams.limit}
        page={listParams.page}
        totalPages={typed?.pagination?.totalPages ?? 1}
        onPageChange={(next) => table.setPage(next)}
        keyExtractor={(row) => row.id}
        emptyMessage="No support requests yet."
        onRowClick={(row) => goToViewSupport(row.id)}
      />
    </div>
  );
}
