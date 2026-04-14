"use client";

import { useMemo, useState } from "react";
import { Button, Divider, Menu, Skeleton, Stack, Text } from "@mantine/core";
import { useParams } from "next/navigation";
import { Download } from "lucide-react";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import FormModal, { FormField } from "@/app/admin/_components/FormModal";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import EmptySection from "@/app/admin/_components/EmptySection";
import { useAgentDetails } from "../hooks/useAgentDetails";
import { usePatchData } from "@/app/_lib/api/hooks";
import {
  adminApi,
  type UpdateAgentStatusPayload,
} from "@/app/admin/_services/admin-api";
import { useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import AgentTransactionsTable from "../_agentComponents/AgentTransactionsTable";
import { useManagementLookups } from "../../user-management/hooks/useManagementLookups";

type AgentStatus = "Active" | "Deactivated";

interface AgentDetails {
  id: string;
  name: string;
  status: AgentStatus;
  createdAt: string;
  createdTime: string;
  email: string;
  phone: string;
  branch: string;
  totalTransactions: number;
  transactionValue: number;
  lastTransaction: string;
  documentLabel: string;
  documentUrl: string | null;
}

const formatNaira = (amount: number): string =>
  `₦ ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function AgentDetailsPage() {
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const agentId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const {
    agent: agentData,
    isLoading: isAgentLoading,
    isNotFound,
  } = useAgentDetails(agentId);
  const [statusOverride, setStatusOverride] = useState<AgentStatus | null>(
    null,
  );
  const currentStatus: AgentStatus =
    statusOverride ?? (agentData?.isActive ? "Active" : "Deactivated");
  const [loading, setLoading] = useState(false);

  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editConfirmOpened, setEditConfirmOpened] = useState(false);
  const [editSuccessOpened, setEditSuccessOpened] = useState(false);
  const [pendingEditAgentData, setPendingEditAgentData] = useState<Record<
    string,
    unknown
  > | null>(null);

  const [statusAction, setStatusAction] = useState<
    "deactivate" | "reactivate" | null
  >(null);
  const [statusConfirmOpened, setStatusConfirmOpened] = useState(false);
  const [statusSuccessOpened, setStatusSuccessOpened] = useState(false);

  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (iso?: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const agent = useMemo<AgentDetails>(
    () => ({
      id: agentData?.id ?? "—",
      name: agentData?.name ?? "—",
      status: currentStatus,
      createdAt: formatDate(agentData?.createdAt),
      createdTime: formatTime(agentData?.createdAt),
      email: agentData?.email ?? "—",
      phone: agentData?.phoneNumber ?? "—",
      branch: agentData?.branch?.name ?? "—",
      totalTransactions: agentData?.totalTransactions ?? 0,
      transactionValue: agentData?.transactionValue ?? 0,
      lastTransaction: "—",
      documentLabel: agentData?.attachments?.[0]?.fileName ?? "No attachment",
      documentUrl: agentData?.attachments?.[0]?.fileUrl ?? null,
    }),
    [agentData, currentStatus],
  );

  const { options: branchOptions, isLoading: branchesLoading } =
    useManagementLookups("branch", "name");

  const editAgentFields: FormField[] = useMemo(
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
        required: false,
        accept: ".pdf,.jpg,.jpeg,.png",
        maxSize: 2,
        description: "Upload KYC document (Max: 2 MB)",
      },
    ],
    [branchOptions, branchesLoading],
  );

  const handleEditSubmit = (data: Record<string, unknown>) => {
    // Persist the edit payload until user confirms.
    setPendingEditAgentData(data);
    setEditConfirmOpened(true);
  };

  const performEditAgent = async () => {
    if (!agentId || !pendingEditAgentData) return;

    try {
      setLoading(true);

      const payload = pendingEditAgentData as Record<string, unknown>;

      const formData = new FormData();
      formData.append("name", String(payload.name ?? ""));
      formData.append("email", String(payload.email ?? ""));
      formData.append("phoneNumber", String(payload.phoneNumber ?? ""));
      formData.append("branch", String(payload.branch ?? ""));

      const attachment = payload.attachment;
      if (attachment instanceof File) {
        formData.append("attachment", attachment);
      }

      await adminApi.agent.update(agentId, formData);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...adminKeys.agent.all],
        }),
        queryClient.invalidateQueries({
          queryKey: [...adminKeys.agent.stats()],
        }),
        queryClient.invalidateQueries({
          queryKey: [...adminKeys.agent.detail(agentId)],
        }),
      ]);

      setEditModalOpened(false);
      setEditConfirmOpened(false);
      setPendingEditAgentData(null);
      setEditSuccessOpened(true);

      notifications.show({
        title: "Agent Updated",
        message: "Agent details have been successfully updated.",
        color: "green",
      });
    } catch (error) {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse;
      notifications.show({
        title: "Update Agent Failed",
        message:
          apiResponse?.error?.message ??
          (error as Error)?.message ??
          "Failed to update agent details. Please try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const isCurrentlyActive = currentStatus === "Active";

  const toggleStatusMutation = usePatchData(
    (payload: UpdateAgentStatusPayload) =>
      adminApi.agent.updateStatus(agentId!, payload),
    {
      onSuccess: async (_response, variables) => {
        notifications.show({
          title: "Status Updated",
          message: `Agent has been ${
            variables.isActive ? "reactivated" : "deactivated"
          } successfully.`,
          color: "green",
        });
        setStatusOverride(variables.isActive ? "Active" : "Deactivated");
        setStatusConfirmOpened(false);
        setStatusSuccessOpened(true);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.agent.all],
          }),
          ...(agentId
            ? [
                queryClient.invalidateQueries({
                  queryKey: [...adminKeys.agent.detail(agentId)],
                }),
              ]
            : []),
        ]);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Update Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to update agent status. Please try again.",
          color: "red",
        });
      },
    },
  );

  const performStatusChange = async () => {
    if (!statusAction || !agentId || toggleStatusMutation.isPending) return;
    toggleStatusMutation.mutate({
      isActive: statusAction === "reactivate",
    });
  };

  if (!isAgentLoading && (!agentData || isNotFound)) {
    return (
      <div className="space-y-6">
        <EmptySection
          title="Agent Not Found"
          description="The requested agent could not be found or may have been removed."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Agent Details Card */}
      <div className="rounded-xl bg-white p-5 shadow-sm space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Stack gap={4} className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              {isAgentLoading ? (
                <Skeleton height={24} width={220} />
              ) : (
                <>
                  <Text size="xl" fw={600}>
                    {agent.name}
                  </Text>
                  {/* <StatusBadge status={currentStatus} /> */}
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-[#6B7280]">
              <span>
                <span className="font-medium text-[#111827]">
                  Date Created:
                </span>{" "}
                {agent.createdAt} | {agent.createdTime}
              </span>
              {!isAgentLoading && (
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-emerald-700 font-medium">
                    {currentStatus}
                  </span>
                </span>
              )}
            </div>
          </Stack>

          <Menu position="bottom-end" shadow="md" width={160}>
            <Menu.Target>
              <Button
                radius="xl"
                size="md"
                color="#DD4F05"
                className="self-start md:self-auto"
                disabled={
                  !agentData || isAgentLoading || toggleStatusMutation.isPending
                }
              >
                Take Action
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item onClick={() => setEditModalOpened(true)}>
                Edit
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                onClick={() => {
                  setStatusAction(
                    isCurrentlyActive ? "deactivate" : "reactivate",
                  );
                  setStatusConfirmOpened(true);
                }}
              >
                {isCurrentlyActive ? "Deactivate" : "Reactivate"}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>

        <Divider />

        {/* Agent Details Summary */}
        <div>
          <Text fw={600} className="mb-4! text-orange-500!">
            Agent Details
          </Text>

          <div className="grid gap-6 md:grid-cols-4">
            <DetailItem
              label="Agent ID"
              value={agent.id.slice(0, 6)}
              loading={isAgentLoading}
            />
            <DetailItem
              label="Email Address"
              value={agent.email}
              loading={isAgentLoading}
            />
            <DetailItem
              label="Phone Number"
              value={agent.phone}
              loading={isAgentLoading}
            />
            <DetailItem
              label="Branch"
              value={agent.branch}
              loading={isAgentLoading}
            />
            <DetailItem
              label="Total Transactions"
              value={String(agent.totalTransactions)}
              loading={isAgentLoading}
            />
            <DetailItem
              label="Transaction Value"
              value={formatNaira(agent.transactionValue)}
              loading={isAgentLoading}
            />
            <DetailItem
              label="Last Transaction"
              value={agent.lastTransaction}
              loading={isAgentLoading}
            />

            <div className="space-y-1">
              <Text size="xs" className="text-body-text-50!" mb={4}>
                Doc
              </Text>
              <Button
                variant="subtle"
                color="orange"
                size="xs"
                leftSection={<Download size={14} />}
                className="px-0"
                disabled={isAgentLoading || !agent.documentUrl}
                onClick={() => {
                  if (!agent.documentUrl) return;
                  window.open(
                    agent.documentUrl,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
              >
                {agent.documentLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Agent Modal Flow */}
      <FormModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title="Edit Agent Details"
        description="View and manage agent details"
        fields={editAgentFields}
        submitLabel="Save Changes"
        cancelLabel="Close"
        loading={loading}
        size="lg"
        initialValues={{
          name: agent.name,
          branch: agent.branch,
          email: agent.email,
          phoneNumber: agent.phone,
        }}
        onSubmit={handleEditSubmit}
      />

      <ConfirmationModal
        opened={editConfirmOpened}
        onClose={() => setEditConfirmOpened(false)}
        title="Save Changes ?"
        message="Are you sure, save and update this changes? Kindly note that this new changes would override the existing data."
        primaryButtonText="Yes, Save and Update Changes"
        secondaryButtonText="No, Close"
        loading={loading}
        onPrimary={performEditAgent}
        onSecondary={() => setEditConfirmOpened(false)}
      />

      <SuccessModal
        opened={editSuccessOpened}
        onClose={() => setEditSuccessOpened(false)}
        title="New Changes Saved"
        message="New changes has been successfully saved and updated."
        primaryButtonText="Manage User"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => {
          setEditSuccessOpened(false);
        }}
        onSecondaryClick={() => {
          setEditSuccessOpened(false);
        }}
      />

      {/* Deactivate / Reactivate Flow */}
      <ConfirmationModal
        opened={statusConfirmOpened}
        onClose={() => setStatusConfirmOpened(false)}
        title={
          statusAction === "deactivate"
            ? "Deactivate Agent ?"
            : "Reactivate Agent ?"
        }
        message={
          statusAction === "deactivate"
            ? "Are you sure, Deactivate this Agent? Kindly note that system access would be temporarily suspended, until the agent is reactivated"
            : "Are you sure, Reactivate this agent user? Kindly note that system access would be restored therefore this agent would now be able to access the system according to their role and related permissions"
        }
        primaryButtonText={
          statusAction === "deactivate"
            ? "Yes, Deactivate Agent"
            : "Yes, Reactivate Agent"
        }
        secondaryButtonText="No, Close"
        loading={toggleStatusMutation.isPending}
        onPrimary={performStatusChange}
        onSecondary={() => setStatusConfirmOpened(false)}
      />

      <SuccessModal
        opened={statusSuccessOpened}
        onClose={() => setStatusSuccessOpened(false)}
        title={
          statusAction === "deactivate"
            ? "Agent Deactivated"
            : "Agent Reactivated"
        }
        message={
          statusAction === "deactivate"
            ? "Agent has been successfully deactivated"
            : "Agent has been successfully Reactivated"
        }
        primaryButtonText="Manage Agent"
        secondaryButtonText="No, Close"
        onPrimaryClick={() => {
          setStatusSuccessOpened(false);
        }}
        onSecondaryClick={() => {
          setStatusSuccessOpened(false);
        }}
      />

      <AgentTransactionsTable agentId={agentId ?? ""} />
    </div>
  );
}
