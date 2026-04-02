"use client";

import { useMemo, useState } from "react";
import StatCard from "@/app/admin/_components/StatCard";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { Group, TextInput, Select, Button, Text, Skeleton } from "@mantine/core";
import { ListFilter, Plus, Search, Upload, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";
import { useDebouncedValue } from "@mantine/hooks";
import { useGetExportData } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useBranchStats } from "../hooks/useBranchStats";
import { useBranches, type BranchListItem } from "../hooks/useBranches";

const branchHeaders = [
  { label: "Branch Name", key: "name" },
  { label: "Branch Manager", key: "manager" },
  { label: "Address", key: "address" },
  { label: "Status", key: "status" },
  { label: "Action", key: "action" },
];

const PAGE_SIZE = 10;

function getIsActiveParam(value: string | null): boolean | undefined {
  if (!value) return undefined;
  if (value === "Active") return true;
  if (value === "Deactivated") return false;
  return undefined;
}

export default function BranchSection() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const { stats, isLoading: isStatsLoading } = useBranchStats();
  const isStatsEmpty = !isStatsLoading && !stats;

  const queryParams = useMemo(() => {
    const trimmedSearch = debouncedSearch.trim();

    return {
      page,
      limit: PAGE_SIZE,
      search: trimmedSearch || undefined,
      isActive: getIsActiveParam(filter),
    };
  }, [debouncedSearch, filter, page]);

  const { branches, isLoading, totalPages } = useBranches(queryParams);

  const exportBranchesMutation = useGetExportData(
    () =>
      adminApi.outlet.branches.export({
        search: debouncedSearch.trim() || undefined,
        isActive: getIsActiveParam(filter),
      }),
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);

        link.href = objectUrl;
        link.download = `branches-${dateStamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Export Branches Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to export branches at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );

  const renderRow = (item: BranchListItem) => [
    <div key="name">
      <Text fw={500} size="sm">
        {item.name}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{item.id}
      </Text>
    </div>,
    <div key="manager">
      <Text fw={500} size="sm">
        {item.managerName}
      </Text>
      <Text size="xs" c="dimmed">
        {item.managerEmail}
      </Text>
    </div>,
    <Text key="address" size="sm">
      {item.address}
    </Text>,
    <StatusBadge key="status" status={item.status} />,
    <RowActionIcon
      key="action"
      onClick={() => router.push(adminRoutes.adminOutletBranchDetails(item.id))}
    />,
  ];

  return (
    <>
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isStatsLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} height={90} radius="md" />
            ))
          ) : (
            <>
              <StatCard
                title="No. of Branches"
                value={stats?.total ?? 0}
                icon={<Building2 className="h-5 w-5 text-orange-600" />}
                iconBg="bg-orange-100"
                isEmpty={isStatsEmpty}
              />
              <StatCard
                title="Active Branches"
                value={stats?.active ?? 0}
                icon={<Building2 className="h-5 w-5 text-green-600" />}
                iconBg="bg-green-100"
                isEmpty={isStatsEmpty}
              />
              <StatCard
                title="Deactivated Branches"
                value={stats?.deactivated ?? 0}
                icon={<Building2 className="h-5 w-5 text-pink-600" />}
                iconBg="bg-[#FFE4E8]"
                isEmpty={isStatsEmpty}
              />
            </>
          )}
        </div>
      </div>

      <div className="my-5 rounded-lg bg-white p-5">
        <Group justify="space-between" mb="md" wrap="wrap">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">All Branches</h2>
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
          </div>
          <Group>
            <Select
              value={filter}
              onChange={(value) => {
                setFilter(value);
                setPage(1);
              }}
              data={["Active", "Deactivated"]}
              placeholder="Filter By"
              clearable
              radius="xl"
              w={120}
              rightSection={<ListFilter size={16} />}
            />
            <Button
              variant="outline"
              color="#E36C2F"
              radius="xl"
              rightSection={<Upload size={16} />}
              onClick={() => exportBranchesMutation.mutate()}
              loading={exportBranchesMutation.isPending}
              disabled={exportBranchesMutation.isPending}
            >
              Export
            </Button>
            <Button
              variant="filled"
              color="#DD4F05"
              radius="xl"
              leftSection={<Plus size={16} />}
              onClick={() => router.push(adminRoutes.adminOutletBranchCreate())}
            >
              Add New +
            </Button>
          </Group>
        </Group>
        <DynamicTableSection
          headers={branchHeaders}
          data={branches}
          loading={isLoading}
          renderItems={renderRow}
          emptyTitle="No Branches Found"
          emptyMessage="There are currently no branches to display."
          pagination={{
            page,
            totalPages,
            onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
            onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
            onPageChange: setPage,
          }}
        />
      </div>
    </>
  );
}
