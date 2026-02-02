"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Text,
  Group,
  Button,
  TextInput,
  Select,
  Menu,
  Divider,
} from "@mantine/core";
import { Search, ListFilter, Upload } from "lucide-react";
import { adminRoutes } from "@/lib/adminRoutes";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import FormModal, { type FormField } from "@/app/admin/_components/FormModal";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";

type BranchStatus = "Active" | "Deactivated";
type TabKey = "agents" | "transactions";

interface AgentRow {
  id: string;
  agentName: string;
  phone: string;
  email: string;
  totalTransactions: number;
  transactionVolume: number;
  status: "Active" | "Deactivated";
}

const AGENTS_MOCK: AgentRow[] = [
  { id: "9023", agentName: "Tunde Bashorun", phone: "+234 90 2323 4545", email: "tunde@eternalglobal.com", totalTransactions: 209, transactionVolume: 1250000, status: "Active" },
  { id: "9025", agentName: "Queen Omotola", phone: "+234 90 5858 3939", email: "queen@kudimata.com", totalTransactions: 9, transactionVolume: 875000, status: "Active" },
  { id: "9026", agentName: "Samuel Olubanki", phone: "+234 91 2222 4545", email: "olubankisamuel@gmail.com", totalTransactions: 120, transactionVolume: 930500, status: "Active" },
  { id: "9024", agentName: "Ibrahim Dantata", phone: "+234 90 5858 3939", email: "ibrahim@sultan.com", totalTransactions: 50, transactionVolume: 1100000, status: "Deactivated" },
  { id: "9027", agentName: "Mfon Ubot", phone: "+234 90 2323 4545", email: "mubot@greenfield.com", totalTransactions: 60, transactionVolume: 790000, status: "Active" },
  { id: "9028", agentName: "Sariki Sudan", phone: "+234 81 0000 3456", email: "nagode@gmail.com", totalTransactions: 98, transactionVolume: 980000, status: "Deactivated" },
];

const agentHeaders = [
  { label: "Agent", key: "agent" },
  { label: "Contact", key: "contact" },
  { label: "Total Transactions", key: "totalTransactions" },
  { label: "Transaction Volume", key: "transactionVolume" },
  { label: "Status", key: "status" },
  { label: "Action", key: "action" },
];

interface TransactionRow {
  id: string;
  transactionId: string;
  actionDate: string;
  actionTime: string;
  branchName: string;
  agentName: string;
  type: string;
  actionEffect: "Posted" | "Pending" | "Rejected";
}

const TRANSACTIONS_MOCK: TransactionRow[] = [
  { id: "tx1", transactionId: "7844gAGAA563A", actionDate: "September 12, 2025", actionTime: "11:00 am", branchName: "Ikoyi Axis", agentName: "Eddy Ubong", type: "BTA", actionEffect: "Posted" },
  { id: "tx2", transactionId: "7844gAGAA563A", actionDate: "September 12, 2025", actionTime: "11:00 am", branchName: "Victoria Island", agentName: "Sarah Olufemi", type: "PTA", actionEffect: "Pending" },
  { id: "tx3", transactionId: "7844gAGAA563A", actionDate: "September 12, 2025", actionTime: "11:00 am", branchName: "Lekki Phase 1", agentName: "Chinedu Okafor", type: "School Fees", actionEffect: "Rejected" },
  { id: "tx4", transactionId: "7844gAGAA563A", actionDate: "September 12, 2025", actionTime: "11:00 am", branchName: "Surulere", agentName: "Tolu Adebayo", type: "Expatriate", actionEffect: "Pending" },
  { id: "tx5", transactionId: "7844gAGAA563A", actionDate: "September 12, 2025", actionTime: "11:00 am", branchName: "Ikorodu", agentName: "Amanda Nwosu", type: "BTA", actionEffect: "Posted" },
];

const transactionHeaders = [
  { label: "Transaction ID", key: "transactionId" },
  { label: "Action Date", key: "actionDate" },
  { label: "Branch/Agent", key: "branchAgent" },
  { label: "Type", key: "type" },
  { label: "Action Effect", key: "actionEffect" },
  { label: "Action", key: "action" },
];

const EDIT_BRANCH_STATES = [
  { value: "Lagos", label: "Lagos" },
  { value: "Abuja", label: "Abuja" },
  { value: "Kano", label: "Kano" },
  { value: "Rivers", label: "Rivers" },
  { value: "Oyo", label: "Oyo" },
  { value: "Enugu", label: "Enugu" },
  { value: "Kaduna", label: "Kaduna" },
  { value: "Delta", label: "Delta" },
  { value: "Ogun", label: "Ogun" },
  { value: "Anambra", label: "Anambra" },
];

const editBranchFields: FormField[] = [
  { name: "branchName", label: "Branch Name", type: "text", required: true, placeholder: "e.g. Yaba" },
  { name: "branchEmail", label: "Email Address", type: "email", required: true, placeholder: "e.g. yababranch@sohcahtoa.com" },
  { name: "state", label: "State", type: "select", required: true, placeholder: "Select state", options: EDIT_BRANCH_STATES },
  { name: "address", label: "Address", type: "textarea", required: true, placeholder: "e.g. No 14, Unilag Rd, Yaba Lagos.", minRows: 2 },
  { name: "branchManager", label: "Branch Manager", type: "text", required: true, placeholder: "e.g. Bashorun Dauda" },
  { name: "managerEmail", label: "Email Address", type: "email", required: true, placeholder: "e.g. bashorun@sohcahtoa.com" },
  { name: "phone", label: "Phone Number", type: "tel", required: true, placeholder: "+234 8138989206" },
];

const formatNaira = (amount: number): string =>
  `₦ ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function BranchDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";

  const [status, setStatus] = useState<BranchStatus>("Active");
  const [activeTab, setActiveTab] = useState<TabKey>("agents");

  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const [reactivateConfirmOpen, setReactivateConfirmOpen] = useState(false);
  const [deactivateSuccessOpen, setDeactivateSuccessOpen] = useState(false);
  const [reactivateSuccessOpen, setReactivateSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [editSuccessOpen, setEditSuccessOpen] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<Record<string, any> | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [agentSearch, setAgentSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("Filter By");
  const [agentPage, setAgentPage] = useState(1);
  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("Filter By");
  const [transactionPage, setTransactionPage] = useState(1);
  const pageSize = 6;

  const branch = {
    id: id || "2223334355",
    name: "Name of Branch",
    dateCreated: "Nov 17 2025 | 11:00am",
    totalAgents: 12,
    managerEmail: "adekunle@sohcatoa.com",
    branchManager: "Gafar Mustapha",
    state: "Lagos",
    branchEmail: "Lekkibranch@sohcatoa.com",
    address: "Chevron Drive, Lekki",
    phone: "+234 90 4747 2791",
    status,
  };

  const isActive = status === "Active";

  const editFormInitialValues = {
    branchName: branch.name,
    branchEmail: branch.branchEmail,
    state: branch.state,
    address: branch.address,
    branchManager: branch.branchManager,
    managerEmail: branch.managerEmail,
    phone: branch.phone,
  };

  const handleEditSubmit = (data: Record<string, any>) => {
    setPendingEditData(data);
    setEditModalOpened(false);
    setEditConfirmOpen(true);
  };

  const handleEditConfirmSave = async () => {
    setEditLoading(true);
    if (pendingEditData) {
      // TODO: persist pendingEditData via API
      await new Promise((r) => setTimeout(r, 600));
    }
    setEditLoading(false);
    setEditConfirmOpen(false);
    setEditSuccessOpen(true);
    setPendingEditData(null);
  };

  const filteredAgents = useMemo(() => {
    return AGENTS_MOCK.filter((a) => {
      const matchesSearch =
        a.agentName.toLowerCase().includes(agentSearch.toLowerCase()) ||
        a.id.includes(agentSearch) ||
        a.email.toLowerCase().includes(agentSearch.toLowerCase()) ||
        a.phone.includes(agentSearch);
      const matchesFilter =
        agentFilter === "Filter By" || agentFilter === "All" || a.status === agentFilter;
      return matchesSearch && matchesFilter;
    });
  }, [agentSearch, agentFilter]);

  const agentTotalPages = Math.ceil(filteredAgents.length / pageSize) || 1;
  const paginatedAgents = useMemo(() => {
    const start = (agentPage - 1) * pageSize;
    return filteredAgents.slice(start, start + pageSize);
  }, [agentPage, filteredAgents]);

  const renderAgentRow = (item: AgentRow) => [
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
      onClick={() => router.push(adminRoutes.adminAgentDetails(item.id))}
    />,
  ];

  const filteredTransactions = useMemo(() => {
    return TRANSACTIONS_MOCK.filter((t) => {
      const matchesSearch =
        t.transactionId.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        t.branchName.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        t.agentName.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        t.type.toLowerCase().includes(transactionSearch.toLowerCase());
      const matchesFilter =
        transactionFilter === "Filter By" ||
        transactionFilter === "All" ||
        t.actionEffect === transactionFilter;
      return matchesSearch && matchesFilter;
    });
  }, [transactionSearch, transactionFilter]);

  const transactionTotalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (transactionPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [transactionPage, filteredTransactions]);

  const renderTransactionRow = (item: TransactionRow) => [
    <Text key="transactionId" size="sm">
      {item.transactionId}
    </Text>,
    <div key="actionDate">
      <Text size="sm">{item.actionDate}</Text>
      <Text size="xs" c="dimmed">
        {item.actionTime}
      </Text>
    </div>,
    <div key="branchAgent">
      <Text fw={500} size="sm">
        {item.branchName}
      </Text>
      <Text size="xs" c="dimmed">
        Agent: {item.agentName}
      </Text>
    </div>,
    <Text key="type" size="sm">
      {item.type}
    </Text>,
    <StatusBadge key="actionEffect" status={item.actionEffect} variant="filled" />,
    <RowActionIcon
      key="action"
      onClick={() =>
        router.push(adminRoutes.adminOutletBranchTransactionDetail(id, item.id))
      }
    />,
  ];

  const handleDeactivateConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setStatus("Deactivated");
    setDeactivateConfirmOpen(false);
    setDeactivateSuccessOpen(true);
    setLoading(false);
  };

  const handleReactivateConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setStatus("Active");
    setReactivateConfirmOpen(false);
    setReactivateSuccessOpen(true);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Text size="xl" fw={600} className="text-gray-900">
                {branch.name}
              </Text>
              <Group gap={8} className="flex-wrap text-sm text-gray-600">
                <span>Date Created: {branch.dateCreated}</span>
                <StatusBadge status={branch.status} />
              </Group>
            </div>

            <Menu position="bottom-end" shadow="md" width={160}>
              <Menu.Target>
                <Button radius="xl" size="md" color="#DD4F05">
                  Take Action
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => setEditModalOpened(true)}>
                  Edit
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  onClick={() =>
                    isActive ? setDeactivateConfirmOpen(true) : setReactivateConfirmOpen(true)
                  }
                >
                  {isActive ? "Deactivate" : "Reactivate"}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>

          <Divider className="my-2" />

          {/* Branch Details */}
          <section className="space-y-4">
            <Text fw={600} className="text-orange-500">
              Branch Details
            </Text>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="Branch ID" value={branch.id} />
              <DetailItem label="Total Agents" value={String(branch.totalAgents)} />
              <DetailItem label="Email Address" value={branch.managerEmail} />
              <DetailItem label="Branch Manager" value={branch.branchManager} />
              <DetailItem label="State" value={branch.state} />
              <DetailItem label="Email Address" value={branch.branchEmail} />
              <DetailItem label="Address" value={branch.address} />
              <DetailItem label="Phone Number" value={branch.phone} />
            </div>
          </section>
        </div>
      </div>

      {/* Tabs + Agents / Transactions */}
      <div className="rounded-2xl bg-white shadow-sm p-6">
        <div className="flex gap-6 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("agents")}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "agents"
                ? "text-primary-500 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Agents
            {activeTab === "agents" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "transactions"
                ? "text-primary-500 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Transactions
            {activeTab === "transactions" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
            )}
          </button>
        </div>

        {activeTab === "agents" ? (
          <>
            <Group justify="space-between" mb="md" wrap="wrap">
              <TextInput
                placeholder="Enter keyword"
                leftSection={<Search size={16} color="#DD4F05" />}
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.currentTarget.value)}
                w={320}
                radius="xl"
              />
              <Group>
                <Select
                  value={agentFilter}
                  onChange={(value) => setAgentFilter(value!)}
                  data={["Filter By", "All", "Active", "Deactivated"]}
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
              headers={agentHeaders}
              data={paginatedAgents}
              loading={false}
              renderItems={renderAgentRow}
              emptyTitle="No Agents Found"
              emptyMessage="There are no agents for this branch."
              pagination={{
                page: agentPage,
                totalPages: agentTotalPages,
                onNext: () => setAgentPage((p) => Math.min(p + 1, agentTotalPages)),
                onPrevious: () => setAgentPage((p) => Math.max(p - 1, 1)),
                onPageChange: setAgentPage,
              }}
            />
          </>
        ) : (
          <>
            <Group justify="space-between" mb="md" wrap="wrap">
              <TextInput
                placeholder="Enter keyword"
                leftSection={<Search size={16} color="#DD4F05" />}
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.currentTarget.value)}
                w={320}
                radius="xl"
              />
              <Group>
                <Select
                  value={transactionFilter}
                  onChange={(value) => setTransactionFilter(value!)}
                  data={["Filter By", "All", "Posted", "Pending", "Rejected"]}
                  radius="xl"
                  w={120}
                  rightSection={<ListFilter size={16} />}
                />
                <Button
                  variant="filled"
                  color="#DD4F05"
                  radius="xl"
                  rightSection={<Upload size={16} />}
                >
                  Export
                </Button>
              </Group>
            </Group>
            <DynamicTableSection
              headers={transactionHeaders}
              data={paginatedTransactions}
              loading={false}
              renderItems={renderTransactionRow}
              emptyTitle="No Transactions Found"
              emptyMessage="There are no transactions for this branch."
              pagination={{
                page: transactionPage,
                totalPages: transactionTotalPages,
                onNext: () =>
                  setTransactionPage((p) => Math.min(p + 1, transactionTotalPages)),
                onPrevious: () => setTransactionPage((p) => Math.max(p - 1, 1)),
                onPageChange: setTransactionPage,
              }}
            />
          </>
        )}
      </div>

      {/* Edit Branch Details modal */}
      <FormModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title="Edit Branch Details"
        description="View and manage branch details"
        fields={editBranchFields}
        initialValues={editFormInitialValues}
        onSubmit={handleEditSubmit}
        submitLabel="Save Changes"
        cancelLabel="Close"
        size="lg"
      />

      {/* Edit save confirmation */}
      <ConfirmationModal
        opened={editConfirmOpen}
        onClose={() => setEditConfirmOpen(false)}
        title="Save Changes ?"
        message="Are you sure, save and update this changes? Kindly note that this new changes would override the existing data."
        primaryButtonText="Yes, Save and Update Changes"
        secondaryButtonText="No, Close"
        onPrimary={handleEditConfirmSave}
        onSecondary={() => setEditConfirmOpen(false)}
        loading={editLoading}
      />

      {/* Edit success */}
      <SuccessModal
        opened={editSuccessOpen}
        onClose={() => setEditSuccessOpen(false)}
        title="New Changes Saved"
        message="New Changes has been successfully Saved and Updated"
        primaryButtonText="Manage Branch"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => setEditSuccessOpen(false)}
        onSecondaryClick={() => setEditSuccessOpen(false)}
      />

      {/* Deactivate confirmation */}
      <ConfirmationModal
        opened={deactivateConfirmOpen}
        onClose={() => setDeactivateConfirmOpen(false)}
        title="Deactivate Branch ?"
        message="Are you sure, Deactivate this branch? Kindly note that system access would be temporarily suspended, until the branch is reactivated"
        primaryButtonText="Yes, Deactivate Branch"
        secondaryButtonText="No, Close"
        onPrimary={handleDeactivateConfirm}
        onSecondary={() => setDeactivateConfirmOpen(false)}
        loading={loading}
      />

      {/* Reactivate confirmation */}
      <ConfirmationModal
        opened={reactivateConfirmOpen}
        onClose={() => setReactivateConfirmOpen(false)}
        title="Reactivate Branch ?"
        message="Are you sure, Reactivate this branch? Kindly note that system access would be restored therefore this admin user would now be able to access the system according to their role and related permissions"
        primaryButtonText="Yes, Reactivate Branch"
        secondaryButtonText="No, Close"
        onPrimary={handleReactivateConfirm}
        onSecondary={() => setReactivateConfirmOpen(false)}
        loading={loading}
      />

      {/* Deactivate success */}
      <SuccessModal
        opened={deactivateSuccessOpen}
        onClose={() => setDeactivateSuccessOpen(false)}
        title="Branch Deactivated"
        message="Branch has been successfully deactivated"
        primaryButtonText="Manage Branch"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => setDeactivateSuccessOpen(false)}
        onSecondaryClick={() => setDeactivateSuccessOpen(false)}
      />

      {/* Reactivate success */}
      <SuccessModal
        opened={reactivateSuccessOpen}
        onClose={() => setReactivateSuccessOpen(false)}
        title="Branch Reactivated"
        message="Branch has been successfully Reactivated"
        primaryButtonText="Manage Branch"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => setReactivateSuccessOpen(false)}
        onSecondaryClick={() => setReactivateSuccessOpen(false)}
      />
    </div>
  );
}
