"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Stack, Text, TextInput, NumberInput, Select, Textarea, Radio, Group } from "@mantine/core";
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
import ApprovalTypeModal, { type ApprovalTypeValue, approvalTypeLabel } from "../../_workflowComponents/ApprovalTypeModal";
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
  approvalType: ApprovalTypeValue | "";
  workflowAction: string;
  branchApplicable: string;
  departmentApplicable: string;
  minAmount: number | "";
  maxAmount: number | "";
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

function toFormLines(stages: WorkflowTemplateEditStage[]): WorkflowLine[] {
  if (!stages.length) {
    return [
      {
        id: `line-${Date.now()}`,
        workflowType: "",
        escalationPeriod: 0,
        escalateToUser: undefined,
        selectedUsers: [],
        selectedRoles: [],
        expanded: true,
      },
    ];
  }

  return stages.map((stage, index) => {
    const mappedUsers: AssignableUser[] = stage.assignees.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      roles: a.roleName ? [a.roleName] : [],
    }));

    const firstUser = mappedUsers[0];

    return {
      id: stage.id || `line-${index + 1}`,
      workflowType: toLineWorkflowType(stage.type),
      escalationPeriod: Number.isFinite(stage.escalationMinutes) ? stage.escalationMinutes : 0,
      escalateToUser: firstUser ? { id: firstUser.id, name: firstUser.name } : undefined,
      selectedUsers: mappedUsers,
      selectedRoles: [],
      expanded: true,
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
      approvalType: "",
      workflowAction: "",
      branchApplicable: "",
      departmentApplicable: "",
      minAmount: "",
      maxAmount: "",
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
          expanded: true,
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
      branchApplicable: (value) => (value ? null : "Branch is required"),
      departmentApplicable: (value) => (value ? null : "Department is required"),
      maxAmount: (value, values) => {
        if (values.approvalType === "RATE") return null;
        if (value === "" || values.minAmount === "") return null;
        if (typeof value === "number" && typeof values.minAmount === "number" && value < values.minAmount) {
          return "Maximum amount must be greater than or equal to minimum amount";
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (!template?.editTemplate || hasInitializedForm) return;

    const processType = template.editTemplate.processType === "FLEXIBLE" ? "flexible" : "rigid";
    const prefilledLines = toFormLines(template.editTemplate.stages);

    setHasInitializedForm(true);
    form.setValues({
      workflowName: template.editTemplate.name,
      workflowDescription: template.editTemplate.description,
      approvalType: template.editTemplate.approvalType,
      workflowAction: template.editTemplate.action,
      branchApplicable: template.editTemplate.branchId,
      departmentApplicable: template.editTemplate.departmentId,
      minAmount: template.editTemplate.minAmount ?? "",
      maxAmount: template.editTemplate.maxAmount ?? "",
      workflowType: processType,
      workflowTemplateType: template.editTemplate.type,
      templateEscalationMinutes: template.editTemplate.escalationMinutes,
      hasPtaRequest: template.editTemplate.hasPtaRequest,
      workflowLines: prefilledLines,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.editTemplate]);

  // Modals
  const [isApprovalTypeModalOpen, setIsApprovalTypeModalOpen] = useState(false);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
  const [escalationModalSession, setEscalationModalSession] = useState(0);
  const [escalationInitialData, setEscalationInitialData] = useState<{
    escalateToId: string | null;
    minutes: number;
  }>({ escalateToId: null, minutes: 0 });
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  // Incremented on every open so AssignToModal remounts fresh each time, regardless
  // of whether the active line changed.
  const [assignModalSession, setAssignModalSession] = useState(0);
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

  // Snapshot the active line's current selections at the moment the modal opens.
  // Keyed on assignModalSession so they only recompute on open, not on every render.
  const assignModalInitialUserIds = useMemo(
    () =>
      form.values.workflowLines
        .find((l) => l.id === activeLineId)
        ?.selectedUsers.map((u) => u.id) ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assignModalSession]
  );
  const assignModalInitialRoleIds = useMemo(
    () =>
      form.values.workflowLines
        .find((l) => l.id === activeLineId)
        ?.selectedRoles.map((r) => r.id) ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assignModalSession]
  );

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
      router.push(adminRoutes.adminSettingsWorkflowDetails(id));
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

  const handleApprovalTypeSelect = (value: ApprovalTypeValue) => {
    form.setFieldValue("approvalType", value);
  };

  // Refs to always read the latest values in stable callbacks without re-creating them.
  const activeLineIdRef = useRef(activeLineId);
  activeLineIdRef.current = activeLineId;

  const workflowLinesRef = useRef(form.values.workflowLines);
  workflowLinesRef.current = form.values.workflowLines;

  const formRef = useRef(form);
  formRef.current = form;

  const handleEscalationSave = useCallback((escalateToId: string, escalateToName: string, minutes: number) => {
    const lineId = activeLineIdRef.current;
    if (!lineId) return;
    formRef.current.setFieldValue(
      "workflowLines",
      workflowLinesRef.current.map((line) =>
        line.id === lineId
          ? { ...line, escalationPeriod: minutes, escalateToUser: { id: escalateToId, name: escalateToName } }
          : line
      )
    );
  }, []);

  const handleAssignConfirm = useCallback((users: AssignableUser[], roles: AssignableRole[]) => {
    const lineId = activeLineIdRef.current;
    if (!lineId) return;
    formRef.current.setFieldValue(
      "workflowLines",
      workflowLinesRef.current.map((line) =>
        line.id === lineId
          ? { ...line, selectedUsers: users, selectedRoles: roles }
          : line
      )
    );
  }, []);

  const handleUpdateWorkflowType = useCallback((lineId: string, type: string) => {
    formRef.current.setFieldValue(
      "workflowLines",
      workflowLinesRef.current.map((line) =>
        line.id === lineId ? { ...line, workflowType: type } : line
      )
    );
  }, []);

  const handleToggleExpanded = useCallback((lineId: string) => {
    formRef.current.setFieldValue(
      "workflowLines",
      workflowLinesRef.current.map((line) =>
        line.id === lineId ? { ...line, expanded: !line.expanded } : line
      )
    );
  }, []);

  const handleRemoveUser = useCallback((lineId: string, userId: string) => {
    formRef.current.setFieldValue(
      "workflowLines",
      workflowLinesRef.current.map((line) =>
        line.id === lineId
          ? { ...line, selectedUsers: line.selectedUsers.filter((u) => u.id !== userId) }
          : line
      )
    );
  }, []);

  const handleRemoveRole = useCallback((lineId: string, roleId: string) => {
    formRef.current.setFieldValue(
      "workflowLines",
      workflowLinesRef.current.map((line) =>
        line.id === lineId
          ? { ...line, selectedRoles: line.selectedRoles.filter((r) => r.id !== roleId) }
          : line
      )
    );
  }, []);

  const handleAddWorkflowLine = useCallback(() => {
    const newLine: WorkflowLine = {
      id: `line-${Date.now()}`,
      workflowType: "",
      escalationPeriod: 0,
      escalateToUser: undefined,
      selectedUsers: [],
      selectedRoles: [],
      expanded: true,
    };
    formRef.current.setFieldValue("workflowLines", [...workflowLinesRef.current, newLine]);
  }, []);

  const handleMoveUp = useCallback((lineId: string) => {
    const lines = workflowLinesRef.current;
    const index = lines.findIndex((line) => line.id === lineId);
    if (index > 0) {
      const newLines = [...lines];
      [newLines[index - 1], newLines[index]] = [newLines[index], newLines[index - 1]];
      formRef.current.setFieldValue("workflowLines", newLines);
    }
  }, []);

  const handleMoveDown = useCallback((lineId: string) => {
    const lines = workflowLinesRef.current;
    const index = lines.findIndex((line) => line.id === lineId);
    if (index < lines.length - 1) {
      const newLines = [...lines];
      [newLines[index], newLines[index + 1]] = [newLines[index + 1], newLines[index]];
      formRef.current.setFieldValue("workflowLines", newLines);
    }
  }, []);

  const handleDeleteLine = useCallback((lineId: string) => {
    const lines = workflowLinesRef.current;
    if (lines.length > 1) {
      formRef.current.setFieldValue(
        "workflowLines",
        lines.filter((line) => line.id !== lineId)
      );
    }
  }, []);

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
      ...(form.values.approvalType ? { approvalType: form.values.approvalType } : {}),
      minAmount: form.values.approvalType === "RATE" ? null : (form.values.minAmount === "" ? null : form.values.minAmount),
      maxAmount: form.values.approvalType === "RATE" ? null : (form.values.maxAmount === "" ? null : form.values.maxAmount),
      processType: form.values.workflowType === "flexible" ? "FLEXIBLE" : "RIGID_LINEAR",
      action: form.values.workflowAction.trim(),
      branchId: form.values.branchApplicable,
      departmentId: form.values.departmentApplicable,
      escalationMinutes: form.values.templateEscalationMinutes,
      hasPtaRequest: form.values.hasPtaRequest,
      stages: form.values.workflowLines.map((line, index) => ({
        id: line.id,
        name: line.workflowType.trim() || `Stage ${index + 1}`,
        type: toStageType(line.workflowType),
        order: index + 1,
        escalationMinutes: line.escalationPeriod,
        escalationAdminId: line.escalateToUser?.id ?? null,
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
    router.push(adminRoutes.adminSettingsWorkflowConfiguration());
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
          onClick={() => router.push(adminRoutes.adminSettingsWorkflowConfiguration())}
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
              label="Approval Type"
              placeholder="Select an Option"
              value={approvalTypeLabel(form.values.approvalType)}
              readOnly
              radius="md"
              onClick={() => setIsApprovalTypeModalOpen(true)}
              classNames={{
                label: "text-sm font-medium text-gray-900 mb-1",
                input: "cursor-pointer",
              }}
              error={form.errors.approvalType}
            />

            <TextInput
              label="Workflow Action"
              placeholder="Enter workflow action"
              {...form.getInputProps("workflowAction")}
              radius="md"
              classNames={{
                label: "text-sm font-medium text-gray-900 mb-1",
              }}
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

            {form.values.approvalType !== "RATE" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <NumberInput
                  label="Minimum Amount"
                  placeholder="Enter minimum amount"
                  value={form.values.minAmount}
                  onChange={(val) => form.setFieldValue("minAmount", typeof val === "number" ? val : "")}
                  min={0}
                  radius="md"
                  classNames={{
                    label: "text-sm font-medium text-gray-900 mb-1",
                  }}
                />
                <NumberInput
                  label="Maximum Amount"
                  placeholder="Enter maximum amount"
                  value={form.values.maxAmount}
                  onChange={(val) => form.setFieldValue("maxAmount", typeof val === "number" ? val : "")}
                  min={0}
                  radius="md"
                  classNames={{
                    label: "text-sm font-medium text-gray-900 mb-1",
                  }}
                  error={form.errors.maxAmount}
                />
              </div>
            )}

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
                    const line = workflowLinesRef.current.find((l) => l.id === lineId);
                    setEscalationInitialData({
                      escalateToId: line?.escalateToUser?.id ?? null,
                      minutes: line?.escalationPeriod ?? 0,
                    });
                    setActiveLineId(lineId);
                    setEscalationModalSession((s) => s + 1);
                    setIsEscalationModalOpen(true);
                  }}
                  onOpenAssignModal={(lineId) => {
                    setActiveLineId(lineId);
                    setAssignModalSession((s) => s + 1);
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
      <ApprovalTypeModal
        opened={isApprovalTypeModalOpen}
        onClose={() => setIsApprovalTypeModalOpen(false)}
        onSelect={handleApprovalTypeSelect}
        value={form.values.approvalType}
      />

      <EscalationProtocolModal
        key={escalationModalSession}
        opened={isEscalationModalOpen}
        onClose={() => setIsEscalationModalOpen(false)}
        onSave={handleEscalationSave}
        users={escalationUsers}
        initialEscalateToId={escalationInitialData.escalateToId}
        initialMinutes={escalationInitialData.minutes}
      />

      <AssignToModal
        key={assignModalSession}
        opened={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onConfirm={handleAssignConfirm}
        users={assignableUsers}
        roles={assignableRoles}
        initialSelectedUserIds={assignModalInitialUserIds}
        initialSelectedRoleIds={assignModalInitialRoleIds}
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
