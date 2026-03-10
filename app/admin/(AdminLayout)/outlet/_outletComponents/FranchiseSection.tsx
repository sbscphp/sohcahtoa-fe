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
import { useFranchises, type FranchiseListItem } from "../hooks/useFranchises";
import { useFranchiseStats } from "../hooks/useFranchiseStats";

const franchiseHeaders = [
  { label: "Franchise Name", key: "name" },
  { label: "Contact Person", key: "contact" },
  { label: "Address", key: "address" },
  { label: "Status", key: "status" },
  { label: "Action", key: "action" },
];

const PAGE_SIZE = 10;

function getStatusParam(value: string | null): string | undefined {
  if (!value) return undefined;
  if (value === "Active") return "active";
  if (value === "Pending") return "pendingApproval";
  if (value === "Deactivated") return "deactivated";
  return undefined;
}

export default function FranchiseSection() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const { stats, isLoading: isStatsLoading } = useFranchiseStats();
  const isStatsEmpty = !isStatsLoading && !stats;

  const queryParams = useMemo(() => {
    const trimmedSearch = debouncedSearch.trim();

    return {
      page,
      limit: PAGE_SIZE,
      search: trimmedSearch || undefined,
      status: getStatusParam(filter),
    };
  }, [debouncedSearch, filter, page]);

  const { franchises, isLoading, totalPages } = useFranchises(queryParams);

  const renderRow = (item: FranchiseListItem) => [
    <div key="name">
      <Text fw={500} size="sm">
        {item.name}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{item.id}
      </Text>
    </div>,
    <div key="contact">
      <Text fw={500} size="sm">
        {item.contactName}
      </Text>
      <Text size="xs" c="dimmed">
        {item.contactEmail}
      </Text>
    </div>,
    <Text key="address" size="sm">
      {item.address}
    </Text>,
    <StatusBadge key="status" status={item.status} />,
    <RowActionIcon
      key="action"
      onClick={() => router.push(adminRoutes.adminOutletFranchiseDetails(item.id))}
    />,
  ];

  return (
    <>
      <div className="w-full rounded-xl bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isStatsLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} height={90} radius="md" />
            ))
          ) : (
            <>
              <StatCard
                title="No. of Franchise"
                value={stats?.total ?? 0}
                icon={<Building2 className="h-5 w-5 text-orange-600" />}
                iconBg="bg-orange-100"
                isEmpty={isStatsEmpty}
              />
              <StatCard
                title="Active Franchise"
                value={stats?.active ?? 0}
                icon={<Building2 className="h-5 w-5 text-green-600" />}
                iconBg="bg-green-100"
                isEmpty={isStatsEmpty}
              />
              <StatCard
                title="Deactivated Franchise"
                value={stats?.deactivated ?? 0}
                icon={<Building2 className="h-5 w-5 text-pink-600" />}
                iconBg="bg-[#FFE4E8]"
                isEmpty={isStatsEmpty}
              />
              <StatCard
                title="Pending Approval"
                value={stats?.pendingApproval ?? 0}
                icon={<Building2 className="h-5 w-5 text-amber-500" />}
                iconBg="bg-amber-100"
                isEmpty={isStatsEmpty}
              />
            </>
          )}
        </div>
      </div>

      <div className="my-5 rounded-lg bg-white p-5">
        <Group justify="space-between" mb="md" wrap="wrap">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">All Franchise</h2>
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
              data={["Active", "Pending", "Deactivated"]}
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
            >
              Export
            </Button>
            <Button
              variant="filled"
              color="#DD4F05"
              radius="xl"
              leftSection={<Plus size={16} />}
              onClick={() => router.push(adminRoutes.adminOutletFranchiseCreate())}
            >
              Add New +
            </Button>
          </Group>
        </Group>
        <DynamicTableSection
          headers={franchiseHeaders}
          data={franchises}
          loading={isLoading}
          renderItems={renderRow}
          emptyTitle="No Franchise Found"
          emptyMessage="There are currently no franchises to display."
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
