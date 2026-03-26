"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Group, Text, TextInput, Select } from "@mantine/core";
import { Search, ListFilter } from "lucide-react";
import { useDebouncedValue } from "@mantine/hooks";
import { adminRoutes } from "@/lib/adminRoutes";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { useFranchiseBranches, type FranchiseBranchListItem } from "../../../hooks/useFranchiseBranches";

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

interface FranchiseBranchesTableProps {
  franchiseId: string;
}

export function FranchiseBranchesTable({ franchiseId }: FranchiseBranchesTableProps) {
  const router = useRouter();
  const [branchSearch, setBranchSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState<string | null>(null);
  const [branchPage, setBranchPage] = useState(1);
  const [debouncedSearch] = useDebouncedValue(branchSearch, 350);

  const queryParams = useMemo(() => {
    const trimmedSearch = debouncedSearch.trim();
    return {
      page: branchPage,
      limit: PAGE_SIZE,
      search: trimmedSearch || undefined,
      isActive: getIsActiveParam(branchFilter),
    };
  }, [branchFilter, branchPage, debouncedSearch]);

  const { branches, isLoading, totalPages } = useFranchiseBranches(franchiseId, queryParams);

  const renderBranchRow = (item: FranchiseBranchListItem) => [
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
    <div data-franchise-id={franchiseId}>
      <Group justify="space-between" mb="md" wrap="wrap">
        <TextInput
          placeholder="Enter keyword"
          leftSection={<Search size={16} color="#DD4F05" />}
          value={branchSearch}
            onChange={(e) => {
              setBranchSearch(e.currentTarget.value);
              setBranchPage(1);
            }}
          w={320}
          radius="xl"
        />
        <Select
          value={branchFilter}
          onChange={(value) => {
            setBranchFilter(value);
            setBranchPage(1);
          }}
          data={["Active", "Deactivated"]}
          placeholder="Filter By"
          clearable
          radius="xl"
          w={120}
          rightSection={<ListFilter size={16} />}
        />
      </Group>
      <DynamicTableSection
        headers={branchHeaders}
        data={branches}
        loading={isLoading}
        renderItems={renderBranchRow}
        emptyTitle="No Branches Found"
        emptyMessage="There are no branches for this franchise."
        pagination={{
          page: branchPage,
          totalPages,
          onNext: () => setBranchPage((p) => Math.min(p + 1, totalPages)),
          onPrevious: () => setBranchPage((p) => Math.max(p - 1, 1)),
          onPageChange: setBranchPage,
        }}
      />
    </div>
  );
}
