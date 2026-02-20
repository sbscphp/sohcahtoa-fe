"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Text, Group, Button, Menu, Divider } from "@mantine/core";
import { adminRoutes } from "@/lib/adminRoutes";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import WorkflowLineView, { ViewWorkflowLine } from "../_workflowComponents/WorkflowLineView";

type WorkflowStatus = "Active" | "Deactivated";

interface WorkflowDetail {
  id: string;
  name: string;
  dateCreated: string;
  timeCreated: string;
  status: WorkflowStatus;
  workflowAction: string;
  description: string;
  branch: string;
  department: string;
  workflowType: string;
  personnelProcesses: ViewWorkflowLine[];
}

const MOCK_WORKFLOW: WorkflowDetail = {
  id: "8933",
  name: "Internal Control and Transaction (PTA) Approval",
  dateCreated: "Nov 17 2025",
  timeCreated: "11:00am",
  status: "Active",
  workflowAction: "PTA Settlement",
  description: "A workflow targeted at approving...",
  branch: "Lagos Branch",
  department: "Audit and Internal Control",
  workflowType: "Rigid Linear",
  personnelProcesses: [
    {
      id: "pl-1",
      workflowType: "Review",
      escalationPeriod: 20,
      escalateToName: "Kunle Alao",
      users: [
        { id: "u1", name: "Adekunle, Ibrahim", email: "kibrahim@sohcahtoa.com", roles: ["Internal Control", "Head of Audit"] },
        { id: "u2", name: "Benson, Clara", email: "cbenson@sohcahtoa.com", roles: ["Internal Control", "Head of Audit"] },
        { id: "u3", name: "Chukwu, David", email: "dchukwu@sohcahtoa.com", roles: ["Internal Control", "Head of Audit"] },
      ],
    },
    {
      id: "pl-2",
      workflowType: "Review",
      escalationPeriod: 20,
      escalateToName: "Kunle Alao",
      users: [
        { id: "u1", name: "Adekunle, Ibrahim", email: "kibrahim@sohcahtoa.com", roles: ["Internal Control", "Head of Audit"] },
        { id: "u2", name: "Benson, Clara", email: "cbenson@sohcahtoa.com", roles: ["Internal Control", "Head of Audit"] },
        { id: "u3", name: "Chukwu, David", email: "dchukwu@sohcahtoa.com", roles: ["Internal Control", "Head of Audit"] },
      ],
    },
    {
      id: "pl-3",
      workflowType: "Approval",
      escalationPeriod: 20,
      escalateToName: "Kunle Alao",
      users: [
        { id: "u1", name: "Adekunle, Ibrahim", email: "kibrahim@sohcahtoa.com", roles: ["Internal Control", "Head of Audit"] },
        { id: "u2", name: "Benson, Clara", email: "cbenson@sohcahtoa.com", roles: ["Internal Control", "Head of Audit"] },
        { id: "u3", name: "Chukwu, David", email: "dchukwu@sohcahtoa.com", roles: ["Internal Control", "Head of Audit"] },
      ],
    },
  ],
};

export default function WorkflowDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";

  const [status, setStatus] = useState<WorkflowStatus>(MOCK_WORKFLOW.status);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const [deactivateSuccessOpen, setDeactivateSuccessOpen] = useState(false);
  const [reactivateConfirmOpen, setReactivateConfirmOpen] = useState(false);
  const [reactivateSuccessOpen, setReactivateSuccessOpen] = useState(false);

  const isActive = status === "Active";
  const workflow = MOCK_WORKFLOW;

  const handleDelete = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setDeleteConfirmOpen(false);
    setDeleteSuccessOpen(true);
  };

  const handleDeactivate = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setDeactivateConfirmOpen(false);
    setStatus("Deactivated");
    setDeactivateSuccessOpen(true);
  };

  const handleReactivate = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setReactivateConfirmOpen(false);
    setStatus("Active");
    setReactivateSuccessOpen(true);
  };

  const handleManageWorkflow = () => {
    router.push(adminRoutes.adminWorkflow());
  };

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Main Card */}
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
                <StatusBadge status={status} />
              </Group>
            </div>

            <Menu position="bottom-end" shadow="md" width={160}>
              <Menu.Target>
                <Button radius="xl" size="md" color="#DD4F05">
                  Take Action
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => router.push(adminRoutes.adminWorkflowEdit(id))}>
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
                <Menu.Divider />
                <Menu.Item
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="text-red-500!"
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>

          <Divider className="my-2" />

          {/* Workflow Details Section */}
          <section className="space-y-4">
            <Text fw={600} className="text-orange-500">
              Workflow Details
            </Text>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <DetailItem label="Workflow Action" value={workflow.workflowAction} />
              <DetailItem label="Description" value={workflow.description} />
              <DetailItem label="Branch" value={workflow.branch} />
              <DetailItem label="Department" value={workflow.department} />
              <DetailItem label="Workflow Type" value={workflow.workflowType} />
              <DetailItem label="Personnel Processes" value={String(workflow.personnelProcesses.length)} />
            </div>
          </section>

          <Divider className="my-2" />

          {/* Personnel Process Section */}
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
                  totalLines={workflow.personnelProcesses.length}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmationModal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Workflow Process ?"
        message="Are you sure, Delete this workflow process  ? Kindly note that this action is irreversible, as data would be deleted permanently"
        primaryButtonText="Yes, Delete Workflow process"
        secondaryButtonText="No, Close"
        onPrimary={handleDelete}
        loading={loading}
      />

      {/* Delete Success */}
      <SuccessModal
        opened={deleteSuccessOpen}
        onClose={() => setDeleteSuccessOpen(false)}
        title="Workflow Process Deleted"
        message="Admin role has been successfully deleted."
        primaryButtonText="Manage Workflow"
        onPrimaryClick={handleManageWorkflow}
        secondaryButtonText="No, Close"
      />

      {/* Deactivate Confirmation */}
      <ConfirmationModal
        opened={deactivateConfirmOpen}
        onClose={() => setDeactivateConfirmOpen(false)}
        title="Deactivate Workflow Process ?"
        message="Are you sure, Deactivate this workflow process  ? Kindly note that for this activities within this workflow action won't need any form of approval nor review therefore user activities when posted would have an effect on the system"
        primaryButtonText="Yes, Deactivate Workflow process"
        secondaryButtonText="No, Close"
        onPrimary={handleDeactivate}
        loading={loading}
      />

      {/* Deactivate Success */}
      <SuccessModal
        opened={deactivateSuccessOpen}
        onClose={() => setDeactivateSuccessOpen(false)}
        title="Workflow Process Deactivated"
        message="Workflow process  has been successfully deactivated"
        primaryButtonText="Manage Workflow"
        onPrimaryClick={handleManageWorkflow}
        secondaryButtonText="No, Close"
      />

      {/* Reactivate Confirmation */}
      <ConfirmationModal
        opened={reactivateConfirmOpen}
        onClose={() => setReactivateConfirmOpen(false)}
        title="Reactivate Workflow ?"
        message="Are you sure, Reactivate this workflow process? Kindly note that workflow action would now be active on the system hence action would now conform to the prior setup/configuration"
        primaryButtonText="Yes, Reactivate Workflow process"
        secondaryButtonText="No, Close"
        onPrimary={handleReactivate}
        loading={loading}
      />

      {/* Reactivate Success */}
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
