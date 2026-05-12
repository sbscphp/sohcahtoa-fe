"use client";

import { useRouter } from "next/navigation";
import { ActionIcon } from "@mantine/core";
import { IconArrowRight } from "@/components/icons/IconArrowRight";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";
import { agentKeys } from "@/app/_lib/api/query-keys";
import { useTableState } from "@/app/_hooks/use-table-state";
import {
  PaginatedTable,
  type PaginatedTableColumn,
} from "@/app/(customer)/_components/common";
import { formatHeaderDateTime } from "@/app/utils/helper/formatLocalDate";
import { getStatusBadge } from "@/app/(customer)/_utils/status-badge";
import type { AgentSupportTicketListItem } from "@/app/_lib/api/types";

interface SupportRequestRow {
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

export default function SupportHistoryPage() {
  const router = useRouter();
  const table = useTableState({ initial: { page: 1, limit: 10 } });

  const listParams = {
    page: table.page ?? 1,
    limit: table.limit ?? 10,
  };

  const { data, isLoading } = useFetchData(
    [...agentKeys.support.tickets.list(listParams)],
    () => agentApi.support.tickets.list(listParams),
    true
  );

  const rows: SupportRequestRow[] =
    data?.data?.map((t: AgentSupportTicketListItem) => ({
      id: t.id,
      categoryDescription: getCategoryLabel(t.category ?? t.caseType),
      date: formatHeaderDateTime(t.timestamp) || t.timestamp,
      status: t.status,
    })) ?? [];

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
        columns={[
          {
            key: "categoryDescription",
            label: "Category",
            headerClassName: "!max-w-[220px]",
            className: "!max-w-[220px]",
            render: (row) => (
              <div className="flex flex-col gap-0.5 min-w-0 max-w-[220px]">
                <span className="font-semibold text-[#4D4B4B] text-sm leading-5 truncate" title={row.categoryDescription}>
                  {row.categoryDescription}
                </span>
                <span className="text-[#6C6969] text-sm font-normal leading-5">{row.date}</span>
              </div>
            ),
          },
          {
            key: "status",
            label: "Status",
            align: "center",
            render: (row) => <div style={getStatusBadge(row.status)}>{row.status}</div>,
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
                style={{ boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)", padding: "10px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/agent/support/history/${row.id}`);
                }}
                aria-label="View support request"
              >
                <IconArrowRight className="w-8 h-8 " />
              </ActionIcon>
            ),
          },
        ] as PaginatedTableColumn<SupportRequestRow>[]}
        isLoading={isLoading}
        pageSize={listParams.limit}
        page={listParams.page}
        totalPages={data?.pagination?.totalPages ?? 1}
        onPageChange={(next) => table.setPage(next)}
        keyExtractor={(row) => row.id}
        emptyMessage="No support requests yet."
        onRowClick={(row) => router.push(`/agent/support/history/${row.id}`)}
      />
    </div>
  );
}
