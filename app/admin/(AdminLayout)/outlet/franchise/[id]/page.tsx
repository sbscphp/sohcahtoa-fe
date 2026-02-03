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
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import FormModal, { type FormField } from "@/app/admin/_components/FormModal";

type FranchiseStatus = "Active" | "Deactivated";
type TabKey = "branches" | "transactions";

interface BranchRow {
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

const EDIT_FRANCHISE_STATES = [
  { value: "Lagos State", label: "Lagos State" },
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

const editFranchiseFields: FormField[] = [
  { name: "franchiseName", label: "Franchise Name", type: "text", required: true, placeholder: "e.g. Sterling Exchange" },
  { name: "state", label: "State", type: "select", required: true, placeholder: "Select state", options: EDIT_FRANCHISE_STATES },
  { name: "address", label: "Address", type: "text", required: true, placeholder: "Enter address" },
  { name: "contactPerson", label: "Contact Person", type: "text", required: true, placeholder: "e.g. Adekunle, Ibrahim Olamide" },
  { name: "emailAddress", label: "Email Address", type: "email", required: true, placeholder: "e.g. olamide@sohcahtoa.com" },
  { name: "phoneNumber1", label: "Phone Number 1", type: "tel", required: true, placeholder: "+234 8056283635" },
  { name: "phoneNumber2", label: "Phone Number 2", type: "tel", required: true, placeholder: "+234 000000000" },
];

export default function FranchiseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";

  const [status, setStatus] = useState<FranchiseStatus>("Active");
  const [activeTab, setActiveTab] = useState<TabKey>("branches");

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

  const [branchSearch, setBranchSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("Filter By");
  const [branchPage, setBranchPage] = useState(1);
  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("Filter By");
  const [transactionPage, setTransactionPage] = useState(1);
  const pageSize = 6;

  const franchise = {
    id: id || "2223334355",
    name: "Name of Franchise",
    dateCreated: "Nov 17 2025 | 11:00am",
    branch: "Lagos Branch",
    contactName: "Adekunle Dimeji",
    noOfAgents: 12,
    email: "adekunle@sohcatoa.com",
    phone: "+234 90 4747 2791",
    status,
  };

  const editFormInitialValues = {
    franchiseName: franchise.name,
    state: "Lagos State",
    address: "No 14 B, Karimu Kotun, VI. Lagos",
    contactPerson: franchise.contactName,
    emailAddress: franchise.email,
    phoneNumber1: franchise.phone,
    phoneNumber2: "+234 000000000",
  };

  const isActive = status === "Active";

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

  const branchTotalPages = Math.ceil(filteredBranches.length / pageSize) || 1;
  const paginatedBranches = useMemo(() => {
    const start = (branchPage - 1) * pageSize;
    return filteredBranches.slice(start, start + pageSize);
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
    <StatusBadge key="actionEffect" status={item.actionEffect} />,
    <RowActionIcon
      key="action"
      onClick={() =>
        router.push(adminRoutes.adminOutletFranchiseTransactionDetail(id, item.id))
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
                {franchise.name}
              </Text>
              <Group gap={8} className="flex-wrap text-sm text-gray-600">
                <span>Date Created: {franchise.dateCreated}</span>
                <StatusBadge status={franchise.status} />
              </Group>
            </div>

            <Group gap="sm">
              <CustomButton buttonType="secondary" size="md" radius="xl">
                View Updates
              </CustomButton>
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
            </Group>
          </div>

          <Divider className="my-2" />

          {/* Franchise Details */}
          <section className="space-y-4">
            <Text fw={600} className="text-orange-500">
              Franchise Details
            </Text>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="Franchise ID" value={franchise.id} />
              <DetailItem label="Branch" value={franchise.branch} />
              <DetailItem label="Contact Person" value={franchise.contactName} />
              <DetailItem label="No of Agents" value={String(franchise.noOfAgents)} />
              <DetailItem label="Email Address" value={franchise.email} />
              <DetailItem label="Phone Number" value={franchise.phone} />
            </div>
          </section>
        </div>
      </div>

      {/* Tabs + Branches / Transactions */}
      <div className="rounded-2xl bg-white shadow-sm p-6">
        <div className="flex gap-6 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("branches")}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === "branches"
                ? "text-primary-500 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Branches
            {activeTab === "branches" && (
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

        {activeTab === "branches" ? (
          <>
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
                onNext: () =>
                  setBranchPage((p) => Math.min(p + 1, branchTotalPages)),
                onPrevious: () => setBranchPage((p) => Math.max(p - 1, 1)),
                onPageChange: setBranchPage,
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
              emptyMessage="There are no transactions for this franchise."
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

      {/* Edit franchise modal */}
      <FormModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title="Edit Franchise Details"
        description="View and manage franchise details"
        fields={editFranchiseFields}
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
        primaryButtonText="Manage Franchise"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => setEditSuccessOpen(false)}
        onSecondaryClick={() => setEditSuccessOpen(false)}
      />

      {/* Deactivate confirmation */}
      <ConfirmationModal
        opened={deactivateConfirmOpen}
        onClose={() => setDeactivateConfirmOpen(false)}
        title="Deactivate Franchise ?"
        message="Are you sure, Deactivate this franchise? Kindly note that system access would be temporarily suspended, until the franchise is reactivated"
        primaryButtonText="Yes, Deactivate Franchise"
        secondaryButtonText="No, Close"
        onPrimary={handleDeactivateConfirm}
        onSecondary={() => setDeactivateConfirmOpen(false)}
        loading={loading}
      />

      {/* Reactivate confirmation */}
      <ConfirmationModal
        opened={reactivateConfirmOpen}
        onClose={() => setReactivateConfirmOpen(false)}
        title="Reactivate Franchise ?"
        message="Are you sure, Reactivate this franchise? Kindly note that system access would be restored therefore this admin user would now be able to access the system according to their role and related permissions"
        primaryButtonText="Yes, Reactivate Franchise"
        secondaryButtonText="No, Close"
        onPrimary={handleReactivateConfirm}
        onSecondary={() => setReactivateConfirmOpen(false)}
        loading={loading}
      />

      {/* Deactivate success */}
      <SuccessModal
        opened={deactivateSuccessOpen}
        onClose={() => setDeactivateSuccessOpen(false)}
        title="Franchise Deactivated"
        message="Franchise has been successfully deactivated"
        primaryButtonText="Manage Franchise"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => setDeactivateSuccessOpen(false)}
        onSecondaryClick={() => setDeactivateSuccessOpen(false)}
      />

      {/* Reactivate success */}
      <SuccessModal
        opened={reactivateSuccessOpen}
        onClose={() => setReactivateSuccessOpen(false)}
        title="Franchise Reactivated"
        message="Admin user has been successfully Reactivated"
        primaryButtonText="Manage Franchise"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => setReactivateSuccessOpen(false)}
        onSecondaryClick={() => setReactivateSuccessOpen(false)}
      />
    </div>
  );
}
