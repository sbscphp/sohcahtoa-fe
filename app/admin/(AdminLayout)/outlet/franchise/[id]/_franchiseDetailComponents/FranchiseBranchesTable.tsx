"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Group, Text, TextInput, Select, Button } from "@mantine/core";
import { Search, ListFilter, Upload } from "lucide-react";
import { adminRoutes } from "@/lib/adminRoutes";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";

export interface BranchRow {
  id: string;
  name: string;
  managerName: string;
  managerEmail: string;
  address: string;
  agents: number;
  status: "Active" | "Pending" | "Deactivated";
}

const BRANCHES_MOCK: BranchRow[] = [
  { id: "9023", name: "Eternal Global", managerName: "Tunde Bashorun", managerEmail: "tunde@eternalglobal.com", address: "Plot 10, Off Jibowu Street, Lagos", agents: 5, status: "Active" },
  { id: "9025", name: "Kudi Mata", managerName: "Queen Omotola", managerEmail: "queen@kudimata.com", address: "123 Odu'a Street, Ibadan", agents: 3, status: "Pending" },
  { id: "9026", name: "Sammy Bureau", managerName: "Samuel Olubanki", managerEmail: "olubankisamuel@gmail.com", address: "Suite 5, 2nd Floor, Enugu Mall, Enugu", agents: 8, status: "Active" },
  { id: "9024", name: "Eko Sulatn", managerName: "Ibrahim Dantata", managerEmail: "ibrahim@sultan.com", address: "Block 5, Victoria Island, Lagos", agents: 2, status: "Deactivated" },
  { id: "9027", name: "Greenfield Exchange", managerName: "Mfon Ubot", managerEmail: "mubot@greenfield.com", address: "66, Zaria Road, Kaduna", agents: 6, status: "Active" },
  { id: "9028", name: "Nagode Limited", managerName: "Sariki Sudan", managerEmail: "nagode@gmail.com", address: "Room 204, Abuja Business Center, A...", agents: 4, status: "Deactivated" },
];

const branchHeaders = [
  { label: "Branch Name", key: "name" },
  { label: "Branch Manager", key: "manager" },
  { label: "Address", key: "address" },
  { label: "Agents", key: "agents" },
  { label: "Status", key: "status" },
  { label: "Action", key: "action" },
];

const PAGE_SIZE = 6;

interface FranchiseBranchesTableProps {
  franchiseId: string;
}

export function FranchiseBranchesTable({ franchiseId }: FranchiseBranchesTableProps) {
  const router = useRouter();
  const [branchSearch, setBranchSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("Filter By");
  const [branchPage, setBranchPage] = useState(1);

  const filteredBranches = useMemo(() => {
    return BRANCHES_MOCK.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(branchSearch.toLowerCase()) ||
        b.id.includes(branchSearch) ||
        b.managerName.toLowerCase().includes(branchSearch.toLowerCase()) ||
        b.managerEmail.toLowerCase().includes(branchSearch.toLowerCase()) ||
        b.address.toLowerCase().includes(branchSearch.toLowerCase());
      const matchesFilter =
        branchFilter === "Filter By" || branchFilter === "All" || b.status === branchFilter;
      return matchesSearch && matchesFilter;
    });
  }, [branchSearch, branchFilter]);

  const branchTotalPages = Math.ceil(filteredBranches.length / PAGE_SIZE) || 1;
  const paginatedBranches = useMemo(() => {
    const start = (branchPage - 1) * PAGE_SIZE;
    return filteredBranches.slice(start, start + PAGE_SIZE);
  }, [branchPage, filteredBranches]);

  const renderBranchRow = (item: BranchRow) => [
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
    <Text key="agents" size="sm">
      {item.agents}
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
          onChange={(e) => setBranchSearch(e.currentTarget.value)}
          w={320}
          radius="xl"
        />
        <Group>
          <Select
            value={branchFilter}
            onChange={(value) => setBranchFilter(value!)}
            data={["Filter By", "All", "Active", "Pending", "Deactivated"]}
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
        </Group>
      </Group>
      <DynamicTableSection
        headers={branchHeaders}
        data={paginatedBranches}
        loading={false}
        renderItems={renderBranchRow}
        emptyTitle="No Branches Found"
        emptyMessage="There are no branches for this franchise."
        pagination={{
          page: branchPage,
          totalPages: branchTotalPages,
          onNext: () => setBranchPage((p) => Math.min(p + 1, branchTotalPages)),
          onPrevious: () => setBranchPage((p) => Math.max(p - 1, 1)),
          onPageChange: setBranchPage,
        }}
      />
    </div>
  );
}
