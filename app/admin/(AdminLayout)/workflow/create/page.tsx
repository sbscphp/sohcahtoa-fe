"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stack, Text, TextInput, Select, Textarea, Radio, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Check } from "lucide-react";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { adminRoutes } from "@/lib/adminRoutes";
import WorkflowActionModal from "../_workflowComponents/WorkflowActionModal";
import EscalationProtocolModal from "../_workflowComponents/EscalationProtocolModal";
import AssignToModal, { AssignableUser, AssignableRole } from "../_workflowComponents/AssignToModal";
import WorkflowLineItem, { WorkflowLine } from "../_workflowComponents/WorkflowLineItem";

// Mock Data
const BRANCHES = [
  { value: "lagos-1", label: "Lagos State Branch (2)" },
  { value: "abuja-1", label: "Abuja Branch" },
  { value: "kano-1", label: "Kano Branch" },
];

const DEPARTMENTS = [
  { value: "finance", label: "Finance & Accounting" },
  { value: "it", label: "IT Support" },
  { value: "hr", label: "Human Resources" },
  { value: "audit", label: "Audit and Internal Control" },
];

const MOCK_USERS: AssignableUser[] = [
  {
    id: "u1",
    name: "Adekunle, Ibrahim",
    email: "kibrahim@sohcahtoa.com",
    roles: ["Internal Control", "Head of Audit"],
  },
  {
    id: "u2",
    name: "Benson, Clara",
    email: "cbenson@sohcahtoa.com",
    roles: ["Finance", "Chief Financial Officer"],
  },
  {
    id: "u3",
    name: "Chukwu, David",
    email: "dchukwu@sohcahtoa.com",
    roles: ["IT Support", "IT Manager"],
  },
  {
    id: "u4",
    name: "Khan, Malik",
    email: "mkhan@sohcahtoa.com",
    roles: ["Internal Control"],
  },
  {
    id: "u5",
    name: "Jide Jadsola",
    email: "jjadsola@sohcahtoa.com",
    roles: ["Head of Audit"],
  },
  {
    id: "u6",
    name: "Kunle Alao",
    email: "kalao@sohcahtoa.com",
    roles: ["Finance"],
  },
];

const MOCK_ROLES: AssignableRole[] = [
  { id: "r1", name: "Audit and Internal Control", userCount: 12 },
  { id: "r2", name: "Human Resources", userCount: 8 },
  { id: "r3", name: "Development Team", userCount: 15 },
  { id: "r4", name: "Marketing Department", userCount: 10 },
];

export default function CreateWorkflowPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Form Management with Mantine useForm
  const form = useForm({
    initialValues: {
      workflowName: "",
      workflowDescription: "",
      workflowAction: "",
      branchApplicable: "",
      departmentApplicable: "",
      workflowType: "rigid" as "rigid" | "flexible",
      workflowLines: [
        {
          id: "line-1",
          workflowType: "",
          escalationPeriod: 0,
          escalateToUser: undefined,
          selectedUsers: [],
          selectedRoles: [],
          expanded: false,
        },
      ] as WorkflowLine[],
    },
    validate: {
      workflowName: (value) => (value.trim() ? null : "Workflow name is required"),
      workflowDescription: (value) => {
        if (!value.trim()) return "Workflow description is required";
        const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
        if (wordCount > 24) return "Description must not exceed 24 words";
        return null;
      },
      workflowAction: (value) => (value ? null : "Workflow action is required"),
      branchApplicable: (value) => (value ? null : "Branch is required"),
      departmentApplicable: (value) => (value ? null : "Department is required"),
    },
  });

  // Modals
  const [isWorkflowActionModalOpen, setIsWorkflowActionModalOpen] = useState(false);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [isDraftConfirmOpen, setIsDraftConfirmOpen] = useState(false);
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const [isDraftSuccessOpen, setIsDraftSuccessOpen] = useState(false);
  const [isPublishSuccessOpen, setIsPublishSuccessOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCancel = () => {
    router.push(adminRoutes.adminWorkflow());
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleWorkflowActionSelect = (action: string) => {
    form.setFieldValue("workflowAction", action);
  };

  const handleEscalationSave = (escalateToId: string, escalateToName: string, minutes: number) => {
    if (!activeLineId) return;
    const updatedLines = form.values.workflowLines.map((line) =>
      line.id === activeLineId
        ? {
            ...line,
            escalationPeriod: minutes,
            escalateToUser: { id: escalateToId, name: escalateToName },
          }
        : line
    );
    form.setFieldValue("workflowLines", updatedLines);
  };

  const handleAssignUsers = (users: AssignableUser[]) => {
    if (!activeLineId) return;
    const updatedLines = form.values.workflowLines.map((line) =>
      line.id === activeLineId
        ? {
            ...line,
            selectedUsers: [...line.selectedUsers, ...users.filter(u => !line.selectedUsers.find(su => su.id === u.id))],
          }
        : line
    );
    form.setFieldValue("workflowLines", updatedLines);
  };

  const handleAssignRoles = (roles: AssignableRole[]) => {
    if (!activeLineId) return;
    const updatedLines = form.values.workflowLines.map((line) =>
      line.id === activeLineId
        ? {
            ...line,
            selectedRoles: [...line.selectedRoles, ...roles.filter(r => !line.selectedRoles.find(sr => sr.id === r.id))],
          }
        : line
    );
    form.setFieldValue("workflowLines", updatedLines);
  };

  const handleUpdateWorkflowType = (id: string, type: string) => {
    const updatedLines = form.values.workflowLines.map((line) =>
      line.id === id ? { ...line, workflowType: type } : line
    );
    form.setFieldValue("workflowLines", updatedLines);
  };

  const handleToggleExpanded = (id: string) => {
    const updatedLines = form.values.workflowLines.map((line) =>
      line.id === id ? { ...line, expanded: !line.expanded } : line
    );
    form.setFieldValue("workflowLines", updatedLines);
  };

  const handleRemoveUser = (lineId: string, userId: string) => {
    const updatedLines = form.values.workflowLines.map((line) =>
      line.id === lineId
        ? { ...line, selectedUsers: line.selectedUsers.filter((u) => u.id !== userId) }
        : line
    );
    form.setFieldValue("workflowLines", updatedLines);
  };

  const handleRemoveRole = (lineId: string, roleId: string) => {
    const updatedLines = form.values.workflowLines.map((line) =>
      line.id === lineId
        ? { ...line, selectedRoles: line.selectedRoles.filter((r) => r.id !== roleId) }
        : line
    );
    form.setFieldValue("workflowLines", updatedLines);
  };

  const handleAddWorkflowLine = () => {
    const newLine: WorkflowLine = {
      id: `line-${Date.now()}`,
      workflowType: "",
      escalationPeriod: 0,
      escalateToUser: undefined,
      selectedUsers: [],
      selectedRoles: [],
      expanded: false,
    };
    form.setFieldValue("workflowLines", [...form.values.workflowLines, newLine]);
  };

  const handleMoveUp = (id: string) => {
    const index = form.values.workflowLines.findIndex((line) => line.id === id);
    if (index > 0) {
      const newLines = [...form.values.workflowLines];
      [newLines[index - 1], newLines[index]] = [newLines[index], newLines[index - 1]];
      form.setFieldValue("workflowLines", newLines);
    }
  };

  const handleMoveDown = (id: string) => {
    const index = form.values.workflowLines.findIndex((line) => line.id === id);
    if (index < form.values.workflowLines.length - 1) {
      const newLines = [...form.values.workflowLines];
      [newLines[index], newLines[index + 1]] = [newLines[index + 1], newLines[index]];
      form.setFieldValue("workflowLines", newLines);
    }
  };

  const handleDeleteLine = (id: string) => {
    if (form.values.workflowLines.length > 1) {
      form.setFieldValue(
        "workflowLines",
        form.values.workflowLines.filter((line) => line.id !== id)
      );
    }
  };

  const handleSaveAsDraft = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    setIsDraftConfirmOpen(false);
    setIsDraftSuccessOpen(true);
  };

  const handlePublish = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    setIsPublishConfirmOpen(false);
    setIsPublishSuccessOpen(true);
  };

  const handleManageWorkflow = () => {
    router.push(adminRoutes.adminWorkflow());
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-2xl bg-white shadow-sm p-6 md:p-8">
        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="relative flex items-center justify-between px-2">
            {/* Connecting line */}
            <div
              className={`absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 ${
                step === 2 ? "bg-orange-500" : "bg-gray-200"
              }`}
            />

            {/* Left step */}
            <div className="relative z-10 flex flex-col items-start">
              {step === 2 ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-orange-500 bg-white" />
              )}
            </div>

            {/* Right step */}
            <div className="relative z-10 flex flex-col items-end">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  step === 2 ? "bg-orange-500" : "bg-gray-300"
                }`}
              />
            </div>
          </div>

          {/* Labels */}
          <div className="mt-2 flex items-center justify-between px-1 text-xs font-medium">
            <span className="text-orange-500">Basic Workflow Information</span>
            <span className={step === 2 ? "text-orange-500" : "text-gray-500"}>
              Personnel Process Flow
            </span>
          </div>
        </div>

        {/* Step Content */}
        {step === 1 ? (
          <Stack gap="lg">
            <div className="text-center mb-4">
              <Text fw={700} size="xl" className="text-gray-900">
                Basic Details
              </Text>
              <Text size="sm" c="dimmed" mt={4}>
                Fill out the basic information for this approval workflow process
              </Text>
            </div>

            <TextInput
              label="Workflow Name"
              placeholder="Enter Workflow Name"
              {...form.getInputProps("workflowName")}
              required
              radius="md"
              classNames={{
                label: "text-sm font-medium text-gray-900 mb-1",
              }}
            />

            <div>
              <Textarea
                label="Workflow Description"
                placeholder="Short description of workflow"
                {...form.getInputProps("workflowDescription")}
                required
                radius="md"
                minRows={3}
                classNames={{
                  label: "text-sm font-medium text-gray-900 mb-1",
                }}
              />
              <Text size="xs" c="dimmed" mt={4}>
                Not more than 24 words counts
              </Text>
            </div>

            <TextInput
              label="Workflow Action"
              placeholder="Select an Option"
              value={form.values.workflowAction}
              readOnly
              required
              radius="md"
              onClick={() => setIsWorkflowActionModalOpen(true)}
              classNames={{
                label: "text-sm font-medium text-gray-900 mb-1",
                input: "cursor-pointer",
              }}
              error={form.errors.workflowAction}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                label="Branch Applicable"
                placeholder="Select an Option"
                data={BRANCHES}
                {...form.getInputProps("branchApplicable")}
                required
                searchable
                radius="md"
                classNames={{
                  label: "text-sm font-medium text-gray-900 mb-1",
                }}
              />

              <div>
                <Select
                  label="Department Applicable"
                  placeholder="Select an Option"
                  data={DEPARTMENTS}
                  {...form.getInputProps("departmentApplicable")}
                  required
                  searchable
                  radius="md"
                  classNames={{
                    label: "text-sm font-medium text-gray-900 mb-1",
                  }}
                />
                <Text size="xs" c="dimmed" mt={4}>
                  A corresponding department within a branch
                </Text>
              </div>
            </div>

            <div>
              <Text size="sm" fw={500} className="text-gray-900 mb-3">
                Workflow Type
              </Text>
              <Text size="sm" c="dimmed" mb={12}>
                Select a preferred Workflow Type
              </Text>
              <Radio.Group
                value={form.values.workflowType}
                onChange={(val) => form.setFieldValue("workflowType", val as "rigid" | "flexible")}
              >
                <Stack gap="md">
                  <div className="rounded-lg border-2 border-gray-200 p-4 hover:border-orange-300 transition-colors">
                    <Radio
                      value="rigid"
                      label="Rigid Linear Workflow process"
                      description="Tasks follow a strict, step-by-step process with no deviations. Each step must be completed before moving to the next.Tasks follow a strict, step-by-step process with no deviations. Each step must be completed before moving to the next."
                      color="orange"
                      classNames={{
                        label: "text-sm font-semibold text-gray-900",
                        description: "text-xs text-gray-600 mt-1",
                      }}
                    />
                  </div>
                  <div className="rounded-lg border-2 border-gray-200 p-4 hover:border-orange-300 transition-colors">
                    <Radio
                      value="flexible"
                      label="Flexible Workflow process"
                      description="Tasks can be adjusted, reordered, or skipped as needed for adaptability."
                      color="orange"
                      classNames={{
                        label: "text-sm font-semibold text-gray-900",
                        description: "text-xs text-gray-600 mt-1",
                      }}
                    />
                  </div>
                </Stack>
              </Radio.Group>
            </div>

            <Group justify="center" wrap="nowrap" gap="sm" mt="xl">
              <CustomButton
                fullWidth
                size="md"
                buttonType="secondary"
                onClick={handleCancel}
              >
                Back
              </CustomButton>
              <CustomButton
                fullWidth
                size="md"
                buttonType="primary"
                onClick={handleNext}
              >
                Continue
              </CustomButton>
            </Group>
          </Stack>
        ) : (
          <Stack gap="lg">
            <div className="text-center mb-4">
              <Text fw={700} size="xl" className="text-gray-900">
                Personnel Process Flow
              </Text>
              <Text size="sm" c="dimmed" mt={4}>
                Configure, and review the escalation process for specific action
              </Text>
            </div>

            {/* Workflow Lines */}
            <div className="space-y-4">
              {form.values.workflowLines.map((line, index) => (
                <WorkflowLineItem
                  key={line.id}
                  line={line}
                  index={index}
                  totalLines={form.values.workflowLines.length}
                  onUpdateWorkflowType={handleUpdateWorkflowType}
                  onOpenEscalationModal={(id) => {
                    setActiveLineId(id);
                    setIsEscalationModalOpen(true);
                  }}
                  onOpenAssignModal={(id) => {
                    setActiveLineId(id);
                    setIsAssignModalOpen(true);
                  }}
                  onToggleExpanded={handleToggleExpanded}
                  onRemoveUser={handleRemoveUser}
                  onRemoveRole={handleRemoveRole}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onDelete={handleDeleteLine}
                />
              ))}
            </div>

            {/* Add Workflow Line Button */}
            <button
              type="button"
              onClick={handleAddWorkflowLine}
              className="text-orange-500 font-medium text-sm hover:text-orange-600 transition-colors"
            >
              Add Workflow Line +
            </button>

            <div className="space-y-3 mt-xl">
              <Group justify="center" wrap="nowrap" gap="sm">
                <CustomButton
                  fullWidth
                  size="md"
                  buttonType="secondary"
                  onClick={handleBack}
                >
                  Back
                </CustomButton>
                <CustomButton
                  fullWidth
                  size="md"
                  buttonType="primary"
                  onClick={() => setIsPublishConfirmOpen(true)}
                >
                  Continue
                </CustomButton>
              </Group>
              <CustomButton
                fullWidth
                size="md"
                buttonType="tertiary"
                onClick={() => setIsDraftConfirmOpen(true)}
              >
                Save as Draft
              </CustomButton>
            </div>
          </Stack>
        )}
      </div>

      {/* Modals */}
      <WorkflowActionModal
        opened={isWorkflowActionModalOpen}
        onClose={() => setIsWorkflowActionModalOpen(false)}
        onSelect={handleWorkflowActionSelect}
      />

      <EscalationProtocolModal
        opened={isEscalationModalOpen}
        onClose={() => setIsEscalationModalOpen(false)}
        onSave={handleEscalationSave}
        users={MOCK_USERS.map((u) => ({ id: u.id, name: u.name }))}
      />

      <AssignToModal
        opened={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSelectUsers={handleAssignUsers}
        onSelectRoles={handleAssignRoles}
        users={MOCK_USERS}
        roles={MOCK_ROLES}
      />

      <ConfirmationModal
        opened={isDraftConfirmOpen}
        onClose={() => setIsDraftConfirmOpen(false)}
        title="Save as Draft ?"
        message="Are you sure you to save this workflow as Draft? Kindly note that this new creation won't be posted ojn the system not go through approval process but would only be saved on your own local"
        primaryButtonText="Yes, Save as Draft"
        secondaryButtonText="No, Close"
        onPrimary={handleSaveAsDraft}
        loading={isSaving}
      />

      <ConfirmationModal
        opened={isPublishConfirmOpen}
        onClose={() => setIsPublishConfirmOpen(false)}
        title="Create New Workflow ?"
        message="Are you sure you to create a new workflow ? Kindly note that this new workflow creation would override existing data provided it has the same workflow action"
        primaryButtonText="Yes, Save as Draft"
        secondaryButtonText="No, Close"
        onPrimary={handlePublish}
        loading={isSaving}
      />

      <SuccessModal
        opened={isDraftSuccessOpen}
        onClose={() => setIsDraftSuccessOpen(false)}
        title="Saved as Draft"
        message="Workflow has been successfully Saved as Draft"
        primaryButtonText="Manage Workflow"
        onPrimaryClick={handleManageWorkflow}
        secondaryButtonText="No, Close"
      />

      <SuccessModal
        opened={isPublishSuccessOpen}
        onClose={() => setIsPublishSuccessOpen(false)}
        title="New Workflow Created"
        message="New Workflow has been successfully Created"
        primaryButtonText="Manage Workflow"
        onPrimaryClick={handleManageWorkflow}
        secondaryButtonText="No, Close"
      />
    </div>
  );
}
