"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Text, Group, Button, Menu, Divider, Skeleton } from "@mantine/core";
import { adminRoutes } from "@/lib/adminRoutes";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import WorkflowLineView from "../_workflowComponents/WorkflowLineView";
import { useWorkflowTemplateDetails } from "../hooks/useWorkflowTemplateDetails";
import { useWorkflowTemplateStatusActions } from "../hooks/useWorkflowTemplateStatusActions";
import { approvalTypeLabel } from "../_workflowComponents/ApprovalTypeModal";

type WorkflowStatus = "Active" | "Deactivated" | "Draft" | "Archived";

function formatAmount(amount: number | null): string {
  if (amount === null) return "--";
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function WorkflowDetailSkeleton() {
  return (
    <div className="w-full mx-auto space-y-6">
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Skeleton height={28} width={280} radius="sm" />
              <Skeleton height={18} width={220} radius="sm" />
            </div>
            <Skeleton height={38} width={120} radius="xl" />
          </div>

          <Divider />

          {/* Details Section */}
          <div className="space-y-4">
            <Skeleton height={16} width={120} radius="sm" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton height={12} width="60%" radius="sm" />
                  <Skeleton height={16} width="80%" radius="sm" />
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* Stages Section */}
          <div className="space-y-4">
            <Skeleton height={16} width={140} radius="sm" />
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton height={40} width={40} radius="xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton height={16} width="40%" radius="sm" />
                      <Skeleton height={14} width="60%" radius="sm" />
                    </div>
                    <Skeleton height={24} width={24} radius="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";
  const { template, isLoading, isError } = useWorkflowTemplateDetails(id);
  const [statusOverride, setStatusOverride] = useState<WorkflowStatus | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const [deactivateSuccessOpen, setDeactivateSuccessOpen] = useState(false);
  const [reactivateConfirmOpen, setReactivateConfirmOpen] = useState(false);
  const [reactivateSuccessOpen, setReactivateSuccessOpen] = useState(false);

  const { deactivate, activate, isDeactivating, isActivating } =
    useWorkflowTemplateStatusActions(id, {
      onDeactivateSuccess: () => {
        setDeactivateConfirmOpen(false);
        setStatusOverride("Deactivated");
        setDeactivateSuccessOpen(true);
      },
      onActivateSuccess: () => {
        setReactivateConfirmOpen(false);
        setStatusOverride("Active");
        setReactivateSuccessOpen(true);
      },
    });

  const workflow = template;
  const currentStatus: WorkflowStatus = statusOverride ?? workflow?.status ?? "Active";

  const handleDelete = async () => {
    setDeleteLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setDeleteLoading(false);
    setDeleteConfirmOpen(false);
    setDeleteSuccessOpen(true);
  };

  const handleDeactivate = () => {
    if (!id || isDeactivating) return;
    deactivate.mutate(undefined);
  };

  const handleReactivate = () => {
    if (!id || isActivating) return;
    activate.mutate(undefined);
  };

  const handleManageWorkflow = () => {
    router.push(adminRoutes.adminSettingsWorkflowConfiguration());
  };

  if (isLoading) {
    return <WorkflowDetailSkeleton />;
  }

  if (isError || !workflow) {
    return (
      <div className="w-full mx-auto space-y-6 rounded-2xl bg-white p-8 shadow-sm">
        <Text size="lg" fw={600} className="text-gray-900">
          Unable to load workflow details
        </Text>
        <Text size="sm" c="dimmed">
          Please refresh the page or return to workflow management.
        </Text>
        <Button radius="xl" size="md" color="#DD4F05" onClick={handleManageWorkflow}>
          Back to Workflows
        </Button>
      </div>
    );
  }

  const showAmounts = workflow.approvalType !== "RATE";

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Text size="xl" fw={600} className="text-gray-900">
                {workflow.name}
              </Text>
              <Group gap={8} className="flex-wrap text-sm text-gray-600">
                <span>Date Created: {workflow.dateCreated} | {workflow.timeCreated}</span>
                <StatusBadge status={currentStatus} />
              </Group>
            </div>

            <Menu position="bottom-end" shadow="md" width={160}>
              <Menu.Target>
                <Button radius="xl" size="md" color="#DD4F05">
                  Take Action
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => router.push(adminRoutes.adminSettingsWorkflowEdit(id))}>
                  Edit
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  onClick={() =>
                    currentStatus === "Active"
                      ? setDeactivateConfirmOpen(true)
                      : setReactivateConfirmOpen(true)
                  }
                >
                  {currentStatus === "Active" ? "Deactivate" : "Reactivate"}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>

          <Divider className="my-2" />

          {/* Workflow Details */}
          <section className="space-y-4">
            <Text fw={600} className="text-orange-500">
              Workflow Details
            </Text>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <DetailItem label="Workflow Name" value={workflow.name} />
              <DetailItem label="Description" value={workflow.description} />
              <DetailItem label="Branch" value={workflow.branch} />
              <DetailItem label="Department" value={workflow.department} />
              <DetailItem label="Workflow Type" value={workflow.workflowType} />
              {workflow.approvalType && (
                <DetailItem
                  label="Approval Type"
                  value={approvalTypeLabel(workflow.approvalType)}
                />
              )}
              {workflow.workflowAction && workflow.workflowAction !== "--" && (
                <DetailItem label="Workflow Action" value={workflow.workflowAction} />
              )}
              <DetailItem
                label="Personnel Processes"
                value={String(workflow.personnelProcesses.length)}
              />
              {showAmounts && (
                <>
                  <DetailItem
                    label="Minimum Amount"
                    value={
                      workflow.minAmount !== null
                        ? formatAmount(workflow.minAmount)
                        : "--"
                    }
                  />
                  <DetailItem
                    label="Maximum Amount"
                    value={
                      workflow.maxAmount !== null
                        ? formatAmount(workflow.maxAmount)
                        : "--"
                    }
                  />
                </>
              )}
            </div>
          </section>

          <Divider className="my-2" />

          {/* Personnel Process */}
          <section className="space-y-4">
            <Text fw={600} className="text-orange-500">
              Personnel Process
            </Text>
            <div className="space-y-4">
              {workflow.personnelProcesses.map((line, index) => (
                <WorkflowLineView
                  key={line.id}
                  line={line}
                  index={index}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <ConfirmationModal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Workflow Process ?"
        message="Are you sure, Delete this workflow process ? Kindly note that this action is irreversible, as data would be deleted permanently"
        primaryButtonText="Yes, Delete Workflow process"
        secondaryButtonText="No, Close"
        onPrimary={handleDelete}
        loading={deleteLoading}
      />
      <SuccessModal
        opened={deleteSuccessOpen}
        onClose={() => setDeleteSuccessOpen(false)}
        title="Workflow Process Deleted"
        message="Admin role has been successfully deleted."
        primaryButtonText="Manage Workflow"
        onPrimaryClick={handleManageWorkflow}
        secondaryButtonText="No, Close"
      />
      <ConfirmationModal
        opened={deactivateConfirmOpen}
        onClose={() => setDeactivateConfirmOpen(false)}
        title="Deactivate Workflow Process ?"
        message="Are you sure, Deactivate this workflow process ? Kindly note that for this activities within this workflow action won't need any form of approval nor review therefore user activities when posted would have an effect on the system"
        primaryButtonText="Yes, Deactivate Workflow process"
        secondaryButtonText="No, Close"
        onPrimary={handleDeactivate}
        loading={isDeactivating}
      />
      <SuccessModal
        opened={deactivateSuccessOpen}
        onClose={() => setDeactivateSuccessOpen(false)}
        title="Workflow Process Deactivated"
        message="Workflow process has been successfully deactivated"
        primaryButtonText="Manage Workflow"
        onPrimaryClick={handleManageWorkflow}
        secondaryButtonText="No, Close"
      />
      <ConfirmationModal
        opened={reactivateConfirmOpen}
        onClose={() => setReactivateConfirmOpen(false)}
        title="Reactivate Workflow ?"
        message="Are you sure, Reactivate this workflow process? Kindly note that workflow action would now be active on the system hence action would now conform to the prior setup/configuration"
        primaryButtonText="Yes, Reactivate Workflow process"
        secondaryButtonText="No, Close"
        onPrimary={handleReactivate}
        loading={isActivating}
      />
      <SuccessModal
        opened={reactivateSuccessOpen}
        onClose={() => setReactivateSuccessOpen(false)}
        title="Workflow Process Reactivated"
        message="Workflow process has been successfully Reactivated"
        primaryButtonText="Manage Workflow"
        onPrimaryClick={handleManageWorkflow}
        secondaryButtonText="No, Close"
      />
    </div>
  );
}
