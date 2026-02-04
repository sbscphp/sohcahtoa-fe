"use client";

import { useState, useMemo } from "react";
import StatCard from "@/app/admin/_components/StatCard";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { Group, TextInput, Select, Button, Text } from "@mantine/core";
import { ListFilter, Plus, Search, Upload, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/lib/adminRoutes";

type OutletStatus = "Active" | "Pending" | "Deactivated";

export interface BranchRow {
  id: string;
  name: string;
  managerName: string;
  managerEmail: string;
  address: string;
  status: OutletStatus;
}

const BRANCH_DATA: BranchRow[] = [
  { id: "9023", name: "Eternal Global", managerName: "Tunde Bashorun", managerEmail: "tunde@eternalglobal.com", address: "Plot 10, Off Jibowu Street, Lagos", status: "Active" },
  { id: "9025", name: "Kudi Mata", managerName: "Queen Omotola", managerEmail: "queen@kudimata.com", address: "123 Odu'a Street, Ibadan", status: "Pending" },
  { id: "9026", name: "Sammy Bureau", managerName: "Samuel Olubanki", managerEmail: "olubankisamuel@gmail.com", address: "Suite 5, 2nd Floor, Enugu Mall, Enugu", status: "Active" },
  { id: "9024", name: "Eko Sulatn", managerName: "Ibrahim Dantata", managerEmail: "ibrahim@sultan.com", address: "Block 5, Victoria Island, Lagos", status: "Deactivated" },
  { id: "9027", name: "Greenfield Exchange", managerName: "Mfon Ubot", managerEmail: "mubot@greenfield.com", address: "66, Zaria Road, Kaduna", status: "Active" },
  { id: "9028", name: "Nagode Limited", managerName: "Sariki Sudan", managerEmail: "nagode@gmail.com", address: "Room 204, Abuja Business Center, A...", status: "Deactivated" },
];

const branchHeaders = [
  { label: "Branch Name", key: "name" },
  { label: "Branch Manager", key: "manager" },
  { label: "Address", key: "address" },
  { label: "Status", key: "status" },
  { label: "Action", key: "action" },
];

export default function BranchSection() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Filter By");
  const pageSize = 6;

  const stats = useMemo(() => {
    const total = BRANCH_DATA.length;
    const active = BRANCH_DATA.filter((b) => b.status === "Active").length;
    const deactivated = BRANCH_DATA.filter((b) => b.status === "Deactivated").length;
    return { total, active, deactivated };
  }, []);

  const filteredData = useMemo(() => {
    return BRANCH_DATA.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.id.includes(search) ||
        b.managerName.toLowerCase().includes(search.toLowerCase()) ||
        b.managerEmail.toLowerCase().includes(search.toLowerCase()) ||
        b.address.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "Filter By" || filter === "All" || b.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [page, filteredData]);

  const renderRow = (item: BranchRow) => [
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
          <StatCard
            title="No. of Branches"
            value={stats.total}
            icon={<Building2 className="h-5 w-5 text-orange-600" />}
            iconBg="bg-orange-100"
          />
          <StatCard
            title="Active Branches"
            value={stats.active}
            icon={<Building2 className="h-5 w-5 text-green-600" />}
            iconBg="bg-green-100"
          />
          <StatCard
            title="Deactivated Branches"
            value={stats.deactivated}
            icon={<Building2 className="h-5 w-5 text-pink-600" />}
            iconBg="bg-[#FFE4E8]"
          />
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
              onChange={(e) => setSearch(e.currentTarget.value)}
              w={320}
              radius="xl"
            />
          </div>
          <Group>
            <Select
              value={filter}
              onChange={(value) => setFilter(value!)}
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
          data={paginatedData}
          loading={false}
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
