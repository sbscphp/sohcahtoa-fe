"use client";

import { useMemo, useState } from "react";
import { Group, Text, TextInput, Select, Button } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { ListFilter, Search, Upload } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";
import { useGetExportData } from "@/app/_lib/api/hooks";
import { notifications } from "@mantine/notifications";
import { adminApi, type BranchAgentExportParams } from "@/app/admin/_services/admin-api";
import { useBranchAgents } from "../../hooks/useBranchAgents";
import type { BranchAgentListItem } from "../../hooks/useBranchAgents";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import type { BranchAgentListParams } from "@/app/admin/_services/admin-api";

const PAGE_SIZE = 6;

const agentHeaders = [
  { label: "Agent", key: "agent" },
  { label: "Contact", key: "contact" },
  { label: "Total Transactions", key: "totalTransactions" },
  { label: "Transaction Volume", key: "transactionVolume" },
  { label: "Status", key: "status" },
  { label: "Action", key: "action" },
];

function formatNaira(amount: number): string {
  return `₦ ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function BranchAgentsTable({ branchId }: { branchId: string }) {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Filter By" | "All" | "Active" | "Deactivated">(
    "Filter By"
  );

  const [debouncedSearch] = useDebouncedValue(search, 350);

  const isActive =
    filter === "Active" ? true : filter === "Deactivated" ? false : undefined;

  const queryParams: BranchAgentListParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch.trim() || undefined,
      isActive,
    }),
    [debouncedSearch, isActive, page]
  );

  const { agents, isLoading, isFetching, totalPages } = useBranchAgents(
    branchId,
    queryParams
  );

  const safeTotalPages = Math.max(1, totalPages);

  const renderAgentRow = (item: BranchAgentListItem) => [
    <div key="agent">
      <Text fw={500} size="sm">
        {item.agentName}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{item.id}
      </Text>
    </div>,
    <div key="contact">
      <Text fw={500} size="sm">
        {item.phone}
      </Text>
      <Text size="xs" c="dimmed">
        {item.email}
      </Text>
    </div>,
    <Text key="totalTransactions" size="sm">
      {item.totalTransactions}
    </Text>,
    <Text key="transactionVolume" size="sm" fw={500}>
      {formatNaira(item.transactionVolume)}
    </Text>,
    <StatusBadge key="status" status={item.status} />,
    <RowActionIcon
      key="action"
      onClick={() => {
        if (!item.id) return;
        router.push(adminRoutes.adminAgentDetails(item.id));
      }}
    />,
  ];

  const exportParams: BranchAgentExportParams = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      isActive,
    }),
    [debouncedSearch, isActive]
  );

  const exportAgentsMutation = useGetExportData(
    () =>
      adminApi.outlet.branches.agents.export(
        branchId,
        exportParams
      ) as Promise<Blob>,
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);

        link.href = objectUrl;
        link.download = `branch-${branchId}-agents-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Export Agents Failed",
          message:
            apiResponse?.error?.message ??
            (error as Error)?.message ??
            "Unable to export branch agents at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );

  return (
    <div data-branch-id={branchId}>
      <Group justify="space-between" mb="md" wrap="wrap">
        <TextInput
          placeholder="Enter keyword"
          leftSection={<Search size={16} color="#DD4F05" />}
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
          }}
          w={320}
          radius="xl"
        />
        <Group>
          <Select
            value={filter}
            onChange={(value) => {
              setFilter((value ?? "Filter By") as typeof filter);
              setPage(1);
            }}
            data={["Filter By", "All", "Active", "Deactivated"]}
            radius="xl"
            w={140}
            rightSection={<ListFilter size={16} />}
          />
          <Button
            variant="outline"
            color="#E36C2F"
            radius="xl"
            rightSection={<Upload size={16} />}
            onClick={() => exportAgentsMutation.mutate()}
            loading={exportAgentsMutation.isPending}
            disabled={exportAgentsMutation.isPending}
          >
            Export
          </Button>
        </Group>
      </Group>

      <DynamicTableSection
        headers={agentHeaders}
        data={agents}
        loading={isLoading || isFetching}
        renderItems={renderAgentRow}
        emptyTitle="No Agents Found"
        emptyMessage="There are no agents for this branch."
        pagination={{
          page,
          totalPages: safeTotalPages,
          onNext: () => setPage((p) => Math.min(p + 1, safeTotalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
    </div>
  );
}

