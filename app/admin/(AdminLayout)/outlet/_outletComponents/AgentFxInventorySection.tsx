"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Group, Skeleton, Text, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Coins, CreditCard, Search, Upload } from "lucide-react";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useGetExportData } from "@/app/_lib/api/hooks";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import StatCard from "@/app/admin/_components/StatCard";
import { adminApi } from "@/app/admin/_services/admin-api";
import { adminRoutes } from "@/lib/adminRoutes";
import { useFxInventoryStats } from "../../settlement/hooks/useFxInventoryStats";
import {
  FX_INVENTORY_AGENTS_PAGE_SIZE,
  useFxInventoryAgents,
  type FxInventoryAgentRow,
} from "../hooks/useFxInventoryAgents";

const AGENT_HEADERS = [
  { label: "Agent", key: "agent" },
  { label: "Contact", key: "contact" },
  { label: "Total Disbursement", key: "totalDisbursement" },
  { label: "Total Lodgment", key: "totalLodgment" },
  { label: "Action", key: "action" },
];

export default function AgentFxInventorySection() {
  const router = useRouter();
  const { stats, isLoading: isStatsLoading, isError: isStatsError } = useFxInventoryStats();
  const statValue = (amount: number | undefined) => (isStatsError ? "—" : (amount ?? 0));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const searchQuery = debouncedSearch.trim() || undefined;

  const queryParams = useMemo(
    () => ({
      page,
      limit: FX_INVENTORY_AGENTS_PAGE_SIZE,
      search: searchQuery,
    }),
    [page, searchQuery]
  );

  const { agents, isLoading, isFetching, totalPages } = useFxInventoryAgents(queryParams);
  const safeTotalPages = Math.max(1, totalPages);

  const renderRow = (item: FxInventoryAgentRow) => [
    <div key="agent">
      <Text fw={500} size="sm">
        {item.name}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{item.agentId}
      </Text>
    </div>,
    <div key="contact">
      <Text fw={500} size="sm">
        {item.phoneNumber}
      </Text>
      <Text size="xs" c="dimmed">
        {item.email}
      </Text>
    </div>,
    <Text key="totalDisbursement" size="sm">
      {item.totalDisbursements}
    </Text>,
    <Text key="totalLodgment" size="sm">
      {item.totalLodgments}
    </Text>,
    <RowActionIcon
      key="action"
      onClick={() =>
        router.push(adminRoutes.adminOutletAgentFxInventoryDetails(item.agentId))
      }
    />,
  ];

  const exportAgents = useGetExportData(
    () => adminApi.fxInventory.exportAgents({ search: searchQuery }) as Promise<Blob>,
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);

        link.href = objectUrl;
        link.download = `agent-fx-inventory-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse | undefined;
        notifications.show({
          title: "Export Agents Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to export agents at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isStatsLoading ? (
          <>
            <Skeleton height={72} radius="md" />
            <Skeleton height={72} radius="md" />
            <Skeleton height={72} radius="md" />
            <Skeleton height={72} radius="md" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Disbursement"
              value={statValue(stats?.totalDisbursements)}
              icon={<Coins className="h-5 w-5 text-primary-400" />}
              iconBg="bg-primary-00"
            />
            <StatCard
              title="Total Lodgments"
              value={statValue(stats?.totalLodgments)}
              icon={<Coins className="h-5 w-5 text-primary-300" />}
              iconBg="bg-primary-00"
            />
            <StatCard
              title="Pending Approvals"
              value={statValue(stats?.pendingApprovals)}
              icon={<Coins className="h-5 w-5 text-yellow-600" />}
              iconBg="bg-yellow-100"
            />
            <StatCard
              title="Approved Disbursement"
              value={statValue(stats?.approvedDisbursements)}
              icon={<CreditCard className="h-5 w-5 text-blue-600" />}
              iconBg="bg-blue-100"
            />
          </>
        )}
      </div>

      <div className="my-5 rounded-lg bg-white p-5">
        <Group justify="space-between" mb="md" wrap="wrap">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Agents</h2>
            <TextInput
              placeholder="Enter keyword"
              leftSection={<Search size={16} color="#DD4F05" />}
              value={search}
              onChange={(event) => {
                setSearch(event.currentTarget.value);
                setPage(1);
              }}
              w={320}
              radius="xl"
            />
          </div>
          <Button
            variant="outline"
            color="#E36C2F"
            radius="xl"
            rightSection={<Upload size={16} />}
            onClick={() => exportAgents.mutate()}
            loading={exportAgents.isPending}
            disabled={exportAgents.isPending}
          >
            Export
          </Button>
        </Group>
        <DynamicTableSection
          headers={AGENT_HEADERS}
          data={agents}
          loading={isLoading || isFetching}
          renderItems={renderRow}
          emptyTitle="No Agents Found"
          emptyMessage="There are currently no agents to display."
          pagination={{
            page,
            totalPages: safeTotalPages,
            onNext: () => setPage((value) => Math.min(value + 1, safeTotalPages)),
            onPrevious: () => setPage((value) => Math.max(value - 1, 1)),
            onPageChange: setPage,
          }}
        />
      </div>
    </>
  );
}
