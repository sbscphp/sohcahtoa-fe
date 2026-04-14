"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Group, Text, TextInput, Select, Button } from "@mantine/core";
import { Search, ListFilter, Upload } from "lucide-react";
import { useDebouncedValue } from "@mantine/hooks";
import { adminRoutes } from "@/lib/adminRoutes";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import {
  useFranchiseBranches,
  type FranchiseBranchListItem,
} from "../../../hooks/useFranchiseBranches";

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

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Deactivated", label: "Deactivated" },
];

interface FranchiseBranchesTableProps {
  franchiseId: string;
}

export function FranchiseBranchesTable({
  franchiseId,
}: FranchiseBranchesTableProps) {
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

  const { branches, isLoading, isFetching, totalPages } = useFranchiseBranches(
    franchiseId,
    queryParams,
  );
  const safeTotalPages = Math.max(1, totalPages);

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

        <Group>
          <Select
            value={branchFilter}
            onChange={(value) => {
              setBranchFilter(value);
              setBranchPage(1);
            }}
            data={statusOptions}
            placeholder="Filter By"
            clearable
            radius="xl"
            w={150}
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
        </Group>
      </Group>
      <DynamicTableSection
        headers={branchHeaders}
        data={branches}
        loading={isLoading || isFetching}
        renderItems={renderBranchRow}
        emptyTitle="No Branches Found"
        emptyMessage="There are no branches for this franchise."
        pagination={{
          page: branchPage,
          totalPages: safeTotalPages,
          onNext: () => setBranchPage((p) => Math.min(p + 1, safeTotalPages)),
          onPrevious: () => setBranchPage((p) => Math.max(p - 1, 1)),
          onPageChange: setBranchPage,
        }}
      />
    </div>
  );
}
