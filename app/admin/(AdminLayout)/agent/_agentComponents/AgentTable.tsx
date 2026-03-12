"use client";

import { useMemo, useState } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import FormModal, { FormField } from "@/app/admin/_components/FormModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import {
  Button,
  Group,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { ListFilter, Plus, Search, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import RowActionIcon from "@/app/admin/_components/RowActionIcon";
import { adminRoutes } from "@/lib/adminRoutes";
import { useDebouncedValue } from "@mantine/hooks";
import { useAgents, type AgentRowItem } from "../hooks/useAgents";
import { useGetExportData } from "@/app/_lib/api/hooks";
import { adminApi, type CreateAgentPayload } from "@/app/admin/_services/admin-api";
import { useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/app/_lib/api/query-keys";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useManagementLookups } from "../../user-management/hooks/useManagementLookups";

/* --------------------------------------------
 Types
--------------------------------------------- */
type Agent = AgentRowItem;

/* --------------------------------------------
 Helpers
--------------------------------------------- */
const formatNaira = (amount: number): string =>
  `₦ ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function AgentTable() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const [filter, setFilter] = useState("Filter By");
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);
  const [successModalOpened, setSuccessModalOpened] = useState(false);
  const [pendingAgentData, setPendingAgentData] =
    useState<Record<string, unknown> | null>(null);

  const isActive =
    filter === "Active" ? true : filter === "Deactivated" ? false : undefined;

  const { agents, isLoading, totalPages } = useAgents({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
    isActive,
  });
  const exportAgentsMutation = useGetExportData(
    () =>
      adminApi.agent.export({
        search: debouncedSearch || undefined,
        isActive,
      }),
    {
      onSuccess: (csvBlob) => {
        const objectUrl = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        const dateStamp = new Date().toISOString().slice(0, 10);

        link.href = objectUrl;
        link.download = `agents-${dateStamp}.csv`;
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
            "Unable to export agents at the moment. Please try again.",
          color: "red",
        });
      },
    }
  );
  const { options: branchOptions, isLoading: branchesLoading } =
    useManagementLookups("branch", "name");

  const agentHeaders = [
    { label: "Agent", key: "agent" },
    { label: "Contact", key: "contact" },
    { label: "Total Transactions", key: "totalTransactions" },
    { label: "Transaction Volume", key: "transactionVolume" },
    { label: "Status", key: "status" },
    { label: "Action", key: "action" },
  ];

  // Form fields for creating a new agent
  const createAgentFields: FormField[] = useMemo(
    () => [
      {
        name: "name",
        label: "Agent Name",
        type: "text",
        required: true,
        placeholder: "Enter agent name",
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "example@email.com",
      },
      {
        name: "branch",
        label: "Branch",
        type: "select",
        required: true,
        placeholder: "Select an Option",
        options: branchOptions,
        disabled: branchesLoading,
      },
      {
        name: "phoneNumber",
        label: "Phone Number",
        type: "tel",
        required: true,
        placeholder: "+234 00 0000 0000",
      },
      {
        name: "attachment",
        label: "Additional Document",
        type: "file",
        required: true,
        accept: ".pdf,.jpg,.jpeg,.png",
        maxSize: 2,
        description: "Upload KYC document (Max: 2 MB)",
      },
    ],
    [branchOptions, branchesLoading]
  );

  const performCreateAgent = async (data: Record<string, unknown>) => {
    try {
      setLoading(true);
      const payload = data as unknown as Partial<CreateAgentPayload>;
      const formData = new FormData();
      formData.append("name", String(payload.name ?? ""));
      formData.append("email", String(payload.email ?? ""));
      formData.append("phoneNumber", String(payload.phoneNumber ?? ""));
      formData.append("branch", String(payload.branch ?? ""));

      if (payload.attachment instanceof File) {
        formData.append("attachment", payload.attachment);
      }

      await adminApi.agent.create(formData);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...adminKeys.agent.all],
        }),
        queryClient.invalidateQueries({
          queryKey: [...adminKeys.agent.stats()],
        }),
      ]);

      setCreateModalOpened(false);
      setConfirmModalOpened(false);
      setSuccessModalOpened(true);
      setPendingAgentData(null);
    } catch (error) {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse;
      notifications.show({
        title: "Create Agent Failed",
        message:
          apiResponse?.error?.message ??
          (error as Error)?.message ??
          "Failed to create agent. Please try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirm = (data: Record<string, unknown>) => {
    setPendingAgentData(data);
    setConfirmModalOpened(true);
  };

  const renderAgentRow = (item: Agent) => [
    // Agent
    <div key="agent">
      <Text fw={500} size="sm">
        {item.agentName}
      </Text>
      <Text size="xs" c="dimmed">
        ID:{item.id}
      </Text>
    </div>,

    // Contact
    <div key="contact">
      <Text fw={500} size="sm">
        {item.phone}
      </Text>
      <Text size="xs" c="dimmed">
        {item.email}
      </Text>
    </div>,

    // Total Transactions
    <Text key="totalTransactions" size="sm">
      {item.totalTransactions}
    </Text>,

    // Transaction Volume
    <Text key="transactionVolume" size="sm" fw={500}>
      {formatNaira(item.transactionVolume)}
    </Text>,

    // Status
    <StatusBadge key="status" status={item.status} />,

    // Action
    <RowActionIcon
      key="action"
      onClick={() => {
        if (!item.id) return;
        router.push(adminRoutes.adminAgentDetails(item.id));
      }}
    />,
  ];

  return (
    <div className="my-5 rounded-lg bg-white p-5">
      <div>
        <Group justify="space-between" mb="md" wrap="wrap">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Agents</h2>
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
                setFilter(value ?? "Filter By");
                setPage(1);
              }}
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
              onClick={() => exportAgentsMutation.mutate()}
              loading={exportAgentsMutation.isPending}
              disabled={exportAgentsMutation.isPending}
            >
              Export
            </Button>

            <Button
              variant="filled"
              color="#DD4F05"
              radius="xl"
              leftSection={<Plus size={16} />}
              onClick={() => setCreateModalOpened(true)}
            >
              Add New
            </Button>
          </Group>
        </Group>
      </div>

      <FormModal
        opened={createModalOpened}
        size="lg"
        onClose={() => setCreateModalOpened(false)}
        title="Create New Agent"
        description="Fill out the basic information of the agent"
        fields={createAgentFields}
        onSubmit={handleOpenConfirm}
        submitLabel="Create Agent"
        loading={loading}
      />

      <ConfirmationModal
        opened={confirmModalOpened}
        onClose={() => setConfirmModalOpened(false)}
        title="Create Agent ?"
        message="Are you sure you want to create this agent? An invite will be sent to the agent’s email address."
        primaryButtonText="Yes, Create"
        secondaryButtonText="No, Close"
        loading={loading}
        onPrimary={async () => {
          if (!pendingAgentData) return;
          await performCreateAgent(pendingAgentData);
        }}
        onSecondary={() => setConfirmModalOpened(false)}
      />

      <SuccessModal
        opened={successModalOpened}
        onClose={() => setSuccessModalOpened(false)}
        title="New Agent Created"
        message="The new agent has been successfully created. You can now manage the agent or close this dialog."
        primaryButtonText="Manage Agents"
        onPrimaryClick={() => {
          setSuccessModalOpened(false);
        }}
      />

      <DynamicTableSection
        headers={agentHeaders}
        data={agents}
        loading={isLoading}
        renderItems={renderAgentRow}
        emptyTitle="No Agents Found"
        emptyMessage="There are currently no agents to display. Agents will appear here once they are created."
        pagination={{
          page,
          totalPages,
          onNext: () => setPage((p) => Math.min(p + 1, totalPages)),
          onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
          onPageChange: setPage,
        }}
      />
    </div>
  );
}

