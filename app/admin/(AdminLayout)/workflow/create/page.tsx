"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stack, Text, TextInput, Select, Textarea, Radio, Group } from "@mantine/core";
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

  // Step 1: Basic Workflow Information
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [workflowAction, setWorkflowAction] = useState("");
  const [branchApplicable, setBranchApplicable] = useState<string | null>(null);
  const [departmentApplicable, setDepartmentApplicable] = useState<string | null>(null);
  const [workflowType, setWorkflowType] = useState<"rigid" | "flexible">("rigid");

  // Step 2: Personnel Process Flow
  const [workflowLines, setWorkflowLines] = useState<WorkflowLine[]>([
    {
      id: "line-1",
      workflowType: "",
      escalationPeriod: 0,
      escalateToUser: undefined,
      selectedUsers: [],
      selectedRoles: [],
      expanded: false,
    },
  ]);

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
    setWorkflowAction(action);
  };

  const handleEscalationSave = (escalateToId: string, escalateToName: string, minutes: number) => {
    if (!activeLineId) return;
    setWorkflowLines((prev) =>
      prev.map((line) =>
        line.id === activeLineId
          ? {
              ...line,
              escalationPeriod: minutes,
              escalateToUser: { id: escalateToId, name: escalateToName },
            }
          : line
      )
    );
  };

  const handleAssignUsers = (users: AssignableUser[]) => {
    if (!activeLineId) return;
    setWorkflowLines((prev) =>
      prev.map((line) =>
        line.id === activeLineId
          ? {
              ...line,
              selectedUsers: [...line.selectedUsers, ...users.filter(u => !line.selectedUsers.find(su => su.id === u.id))],
            }
          : line
      )
    );
  };

  const handleAssignRoles = (roles: AssignableRole[]) => {
    if (!activeLineId) return;
    setWorkflowLines((prev) =>
      prev.map((line) =>
        line.id === activeLineId
          ? {
              ...line,
              selectedRoles: [...line.selectedRoles, ...roles.filter(r => !line.selectedRoles.find(sr => sr.id === r.id))],
            }
          : line
      )
    );
  };

  const handleUpdateWorkflowType = (id: string, type: string) => {
    setWorkflowLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, workflowType: type } : line))
    );
  };

  const handleToggleExpanded = (id: string) => {
    setWorkflowLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, expanded: !line.expanded } : line))
    );
  };

  const handleRemoveUser = (lineId: string, userId: string) => {
    setWorkflowLines((prev) =>
      prev.map((line) =>
        line.id === lineId
          ? { ...line, selectedUsers: line.selectedUsers.filter((u) => u.id !== userId) }
          : line
      )
    );
  };

  const handleRemoveRole = (lineId: string, roleId: string) => {
    setWorkflowLines((prev) =>
      prev.map((line) =>
        line.id === lineId
          ? { ...line, selectedRoles: line.selectedRoles.filter((r) => r.id !== roleId) }
          : line
      )
    );
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
    setWorkflowLines((prev) => [...prev, newLine]);
  };

  const handleMoveUp = (id: string) => {
    const index = workflowLines.findIndex((line) => line.id === id);
    if (index > 0) {
      const newLines = [...workflowLines];
      [newLines[index - 1], newLines[index]] = [newLines[index], newLines[index - 1]];
      setWorkflowLines(newLines);
    }
  };

  const handleMoveDown = (id: string) => {
    const index = workflowLines.findIndex((line) => line.id === id);
    if (index < workflowLines.length - 1) {
      const newLines = [...workflowLines];
      [newLines[index], newLines[index + 1]] = [newLines[index + 1], newLines[index]];
      setWorkflowLines(newLines);
    }
  };

  const handleDeleteLine = (id: string) => {
    if (workflowLines.length > 1) {
      setWorkflowLines((prev) => prev.filter((line) => line.id !== id));
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
              value={workflowName}
              onChange={(e) => setWorkflowName(e.currentTarget.value)}
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
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.currentTarget.value)}
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

            <div>
              <Text size="sm" fw={500} className="text-gray-900 mb-1">
                Workflow Action <span className="text-red-500">*</span>
              </Text>
              <CustomButton
                buttonType="secondary"
                fullWidth
                onClick={() => setIsWorkflowActionModalOpen(true)}
                className="justify-start font-normal text-left"
              >
                {workflowAction || "Select an Option"}
              </CustomButton>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                label="Branch Applicable"
                placeholder="Select an Option"
                data={BRANCHES}
                value={branchApplicable}
                onChange={setBranchApplicable}
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
                  value={departmentApplicable}
                  onChange={setDepartmentApplicable}
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
              <Radio.Group value={workflowType} onChange={(val) => setWorkflowType(val as "rigid" | "flexible")}>
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
              {workflowLines.map((line, index) => (
                <WorkflowLineItem
                  key={line.id}
                  line={line}
                  index={index}
                  totalLines={workflowLines.length}
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
