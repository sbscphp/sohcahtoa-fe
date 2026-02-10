"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  PaginatedTable,
  type PaginatedTableColumn
} from "@/app/(customer)/_components/common";
import { getStatusBadge } from "@/app/(customer)/_utils/status-badge";
import { ActionIcon } from "@mantine/core";
import { HugeiconsIcon } from "@hugeicons/react";
import { CircleArrowRight01Icon } from "@hugeicons/core-free-icons";
import { IconArrowRight } from "@/components/icons/IconArrowRight";

export interface SupportRequestRow {
  id: string;
  categoryDescription: string;
  date: string;
  status: string;
}

const MOCK_HISTORY: SupportRequestRow[] = [
  {
    id: "1",
    categoryDescription: "Failed login/password reset not working.",
    date: "Oct 29, 2025 10:25am",
    status: "Approved"
  },
  {
    id: "2",
    categoryDescription: "Customer unable to access account settings.",
    date: "Oct 29, 2025 10:25am",
    status: "Approved"
  },
  {
    id: "3",
    categoryDescription: "2FA/OTP not delivered.",
    date: "Oct 29, 2025 10:25am",
    status: "Approved"
  },
  {
    id: "4",
    categoryDescription: "BVN/TIN mismatch issue.",
    date: "Oct 29, 2025 10:25am",
    status: "Approved"
  },
  {
    id: "5",
    categoryDescription:
      "Error uploading document (flight ticket, admission letter, Medical bill, etc.)",
    date: "Oct 29, 2025 10:25am",
    status: "Approved"
  }
];

export default function SupportHistorySection() {
  const router = useRouter();

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
        data={MOCK_HISTORY}
        columns={columns}
        pageSize={10}
        keyExtractor={(row) => row.id}
        emptyMessage="No support requests yet."
        onRowClick={(row) => goToViewSupport(row.id)}
      />
    </div>
  );
}
