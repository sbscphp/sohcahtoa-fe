"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Stack, Text, TextInput, Select, Textarea, Radio, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Check } from "lucide-react";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { adminRoutes } from "@/lib/adminRoutes";
import { notifications } from "@mantine/notifications";
import { usePatchData } from "@/app/_lib/api/hooks";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  adminApi,
  type WorkflowTemplateUpdatePayload,
} from "@/app/admin/_services/admin-api";
import WorkflowActionModal from "../../_workflowComponents/WorkflowActionModal";
import EscalationProtocolModal from "../../_workflowComponents/EscalationProtocolModal";
import AssignToModal, { AssignableUser, AssignableRole } from "../../_workflowComponents/AssignToModal";
import WorkflowLineItem, { WorkflowLine } from "../../_workflowComponents/WorkflowLineItem";
import {
  useWorkflowTemplateDetails,
  type WorkflowTemplateEditStage,
} from "../../hooks/useWorkflowTemplateDetails";
import { useWorkflowEditOptions } from "../../hooks/useWorkflowEditOptions";

type WorkflowMode = "rigid" | "flexible";
type WorkflowTemplateType = "REVIEW" | "APPROVAL";

interface EditWorkflowFormValues {
  workflowName: string;
  workflowDescription: string;
  workflowAction: string;
  branchApplicable: string;
  departmentApplicable: string;
  workflowType: WorkflowMode;
  workflowTemplateType: WorkflowTemplateType;
  templateEscalationMinutes: number;
  hasPtaRequest: boolean;
  workflowLines: WorkflowLine[];
}

function toLineWorkflowType(value: string): string {
  const normalized = value.trim().toUpperCase();
  if (!normalized) return "";
  if (normalized === "APPROVAL") return "Approval";
  if (normalized === "DOCUMENTATION") return "Documentation";
  if (normalized === "VERIFICATION") return "Verification";
  return "Review";
}

function toStageType(value: string): WorkflowTemplateUpdatePayload["stages"][number]["type"] {
  const normalized = value.trim().toUpperCase();
  if (normalized === "APPROVAL") return "APPROVAL";
  if (normalized === "DOCUMENTATION") return "DOCUMENTATION";
  if (normalized === "VERIFICATION") return "VERIFICATION";
  return "REVIEW";
}

function toFormLines(
  stages: WorkflowTemplateEditStage[],
  availableUsers: AssignableUser[]
): WorkflowLine[] {
  if (!stages.length) {
    return [
      {
        id: `line-${Date.now()}`,
        workflowType: "",
        escalationPeriod: 0,
        escalateToUser: undefined,
        selectedUsers: [],
        selectedRoles: [],
        expanded: false,
      },
    ];
  }

  return stages.map((stage, index) => {
    const mappedUsers = stage.assigneeIds
      .map((assigneeId) => availableUsers.find((user) => user.id === assigneeId))
      .filter((user): user is AssignableUser => Boolean(user));

    const fallbackEscalateUser = mappedUsers[0];

    return {
      id: stage.id || `line-${index + 1}`,
      workflowType: toLineWorkflowType(stage.type),
      escalationPeriod: Number.isFinite(stage.escalationMinutes) ? stage.escalationMinutes : 0,
      escalateToUser: fallbackEscalateUser
        ? { id: fallbackEscalateUser.id, name: fallbackEscalateUser.name }
        : undefined,
      selectedUsers: mappedUsers,
      selectedRoles: [],
      expanded: false,
    };
  });
}

export default function EditWorkflowPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id ?? "";
  const [step, setStep] = useState<1 | 2>(1);
  const [hasInitializedForm, setHasInitializedForm] = useState(false);
  const {
    template,
    isLoading: templateLoading,
    isError: templateError,
  } = useWorkflowTemplateDetails(id);
  const {
    branchOptions,
    departmentOptions,
    users: assignableUsers,
    roles: assignableRoles,
    escalationUsers,
    isLoading: optionsLoading,
  } = useWorkflowEditOptions();

  const form = useForm<EditWorkflowFormValues>({
    initialValues: {
      workflowName: "",
      workflowDescription: "",
      workflowAction: "",
      branchApplicable: "",
      departmentApplicable: "",
      workflowType: "rigid",
      workflowTemplateType: "APPROVAL",
      templateEscalationMinutes: 0,
      hasPtaRequest: false,
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
      ],
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

  useEffect(() => {
    if (!template?.editTemplate || hasInitializedForm || optionsLoading) return;

    const processType = template.editTemplate.processType === "FLEXIBLE" ? "flexible" : "rigid";
    const prefilledLines = toFormLines(template.editTemplate.stages, assignableUsers);

    form.setValues({
      workflowName: template.editTemplate.name,
      workflowDescription: template.editTemplate.description,
      workflowAction: template.editTemplate.action,
      branchApplicable: template.editTemplate.branchId,
      departmentApplicable: template.editTemplate.departmentId,
      workflowType: processType,
      workflowTemplateType: template.editTemplate.type,
      templateEscalationMinutes: template.editTemplate.escalationMinutes,
      hasPtaRequest: template.editTemplate.hasPtaRequest,
      workflowLines: prefilledLines,
    });
    setTimeout(() => {
      setHasInitializedForm(true);
    }, 0);
  }, [
    assignableUsers,
    form,
    hasInitializedForm,
    optionsLoading,
    template?.editTemplate,
  ]);

  // Modals
  const [isWorkflowActionModalOpen, setIsWorkflowActionModalOpen] = useState(false);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [isSaveSuccessOpen, setIsSaveSuccessOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateWorkflowMutation = usePatchData<
    ApiResponse<unknown>,
    WorkflowTemplateUpdatePayload
  >((payload) => adminApi.workflow.updateTemplate(id, payload), {
    onSuccess: async () => {
      notifications.show({
        title: "Workflow Updated",
        message: "Workflow template has been updated successfully.",
        color: "green",
      });
      setIsSaving(false);
      setIsSaveConfirmOpen(false);
      setIsSaveSuccessOpen(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "workflow", "template", id] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "workflow", "management"] }),
      ]);
    },
    onError: (error) => {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse;
      notifications.show({
        title: "Update Workflow Failed",
        message:
          apiResponse?.error?.message ??
          error.message ??
          "Unable to update workflow template at the moment.",
        color: "red",
      });
      setIsSaving(false);
      setIsSaveConfirmOpen(false);
    },
  });

  const branchLabelOptions = useMemo(() => branchOptions, [branchOptions]);
  const departmentLabelOptions = useMemo(() => departmentOptions, [departmentOptions]);

  const validateStepTwo = () => {
    if (!form.values.workflowLines.length) {
      return "At least one workflow line is required.";
    }

    for (const [index, line] of form.values.workflowLines.entries()) {
      const lineNumber = index + 1;
      if (!line.workflowType.trim()) {
        return `Workflow type is required for line ${lineNumber}.`;
      }
      if (!Number.isFinite(line.escalationPeriod) || line.escalationPeriod <= 0) {
        return `Escalation protocol is required for line ${lineNumber}.`;
      }
      if (!line.selectedUsers.length && !line.selectedRoles.length) {
        return `Please assign at least one user or role for line ${lineNumber}.`;
      }
    }

    return null;
  };

  const handleBack = () => {
    if (step === 1) {
      router.push(adminRoutes.adminWorkflowDetails(id));
    } else {
      setStep(1);
    }
  };

  const handleNext = () => {
    const basicValidation = form.validate();
    if (basicValidation.hasErrors) {
      return;
    }
    setStep(2);
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

  const handleUpdateWorkflowType = (lineId: string, type: string) => {
    const updatedLines = form.values.workflowLines.map((line) =>
      line.id === lineId ? { ...line, workflowType: type } : line
    );
    form.setFieldValue("workflowLines", updatedLines);
  };

  const handleToggleExpanded = (lineId: string) => {
    const updatedLines = form.values.workflowLines.map((line) =>
      line.id === lineId ? { ...line, expanded: !line.expanded } : line
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

  const handleMoveUp = (lineId: string) => {
    const index = form.values.workflowLines.findIndex((line) => line.id === lineId);
    if (index > 0) {
      const newLines = [...form.values.workflowLines];
      [newLines[index - 1], newLines[index]] = [newLines[index], newLines[index - 1]];
      form.setFieldValue("workflowLines", newLines);
    }
  };

  const handleMoveDown = (lineId: string) => {
    const index = form.values.workflowLines.findIndex((line) => line.id === lineId);
    if (index < form.values.workflowLines.length - 1) {
      const newLines = [...form.values.workflowLines];
      [newLines[index], newLines[index + 1]] = [newLines[index + 1], newLines[index]];
      form.setFieldValue("workflowLines", newLines);
    }
  };

  const handleDeleteLine = (lineId: string) => {
    if (form.values.workflowLines.length > 1) {
      form.setFieldValue(
        "workflowLines",
        form.values.workflowLines.filter((line) => line.id !== lineId)
      );
    }
  };

  const handleSaveChanges = async () => {
    const lineValidationError = validateStepTwo();
    if (lineValidationError) {
      notifications.show({
        title: "Validation Error",
        message: lineValidationError,
        color: "red",
      });
      return;
    }

    const payload: WorkflowTemplateUpdatePayload = {
      name: form.values.workflowName.trim(),
      description: form.values.workflowDescription.trim(),
      type: form.values.workflowTemplateType,
      processType: form.values.workflowType === "flexible" ? "FLEXIBLE" : "RIGID_LINEAR",
      action: form.values.workflowAction.trim(),
      branchId: form.values.branchApplicable,
      departmentId: form.values.departmentApplicable,
      escalationMinutes: form.values.templateEscalationMinutes,
      hasPtaRequest: form.values.hasPtaRequest,
      stages: form.values.workflowLines.map((line, index) => ({
        name: line.workflowType.trim() || `Stage ${index + 1}`,
        type: toStageType(line.workflowType),
        order: index + 1,
        escalationMinutes: line.escalationPeriod,
        assignees: line.selectedUsers.map((user, assigneeIndex) => ({
          adminId: user.id,
          order: assigneeIndex + 1,
        })),
      })),
    };

    setIsSaving(true);
    updateWorkflowMutation.mutate(payload);
  };

  const handleManageWorkflow = () => {
    router.push(adminRoutes.adminWorkflow());
  };

  if (templateLoading || optionsLoading) {
    return (
      <div className="max-w-4xl mx-auto rounded-2xl bg-white p-8 shadow-sm">
        <Text size="lg" fw={600}>
          Loading workflow template...
        </Text>
      </div>
    );
  }

  if (templateError || !template) {
    return (
      <div className="max-w-4xl mx-auto rounded-2xl bg-white p-8 shadow-sm space-y-3">
        <Text size="lg" fw={600}>
          Unable to load workflow for editing
        </Text>
        <Text size="sm" c="dimmed">
          Please refresh or return to workflow management.
        </Text>
        <CustomButton
          buttonType="primary"
          size="md"
          onClick={() => router.push(adminRoutes.adminWorkflow())}
        >
          Back to Workflows
        </CustomButton>
      </div>
    );
  }

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
                Edit the basic information for this approval workflow process
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
                data={branchLabelOptions}
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
                  data={departmentLabelOptions}
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
                onClick={handleBack}
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
                  onOpenEscalationModal={(lineId) => {
                    setActiveLineId(lineId);
                    setIsEscalationModalOpen(true);
                  }}
                  onOpenAssignModal={(lineId) => {
                    setActiveLineId(lineId);
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

            <Group justify="center" wrap="nowrap" gap="sm" mt="xl">
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
                onClick={() => setIsSaveConfirmOpen(true)}
              >
                Save Changes
              </CustomButton>
            </Group>
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
        users={escalationUsers}
      />

      <AssignToModal
        opened={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSelectUsers={handleAssignUsers}
        onSelectRoles={handleAssignRoles}
        users={assignableUsers}
        roles={assignableRoles}
      />

      <ConfirmationModal
        opened={isSaveConfirmOpen}
        onClose={() => setIsSaveConfirmOpen(false)}
        title="Save Changes ?"
        message="Are you sure, save and update this changes? Kindly note that this new changes would override the existing data."
        primaryButtonText="Yes, Save and Update Changes"
        secondaryButtonText="No, Close"
        onPrimary={handleSaveChanges}
        loading={isSaving || updateWorkflowMutation.isPending}
      />

      <SuccessModal
        opened={isSaveSuccessOpen}
        onClose={() => setIsSaveSuccessOpen(false)}
        title="New Changes Saved"
        message="New Changes has been successfully Saved and Updated"
        primaryButtonText="Manage Workflow"
        onPrimaryClick={handleManageWorkflow}
        secondaryButtonText="No, Close"
      />
    </div>
  );
}
