"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert, Group, Select, Stack, Text, TextInput } from "@mantine/core";
import { Check } from "lucide-react";
import { notifications } from "@mantine/notifications";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { usePutData } from "@/app/_lib/api/hooks";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { adminRoutes } from "@/lib/adminRoutes";
import { useOutletStates } from "../../../hooks/useOutletStates";
import { useBranchDetails } from "../../../hooks/useBranchDetails";
import { useAgentsAll } from "../../../hooks/useAgentsAll";
import { useQueryClient } from "@tanstack/react-query";
import { adminApi, type CreateBranchPayload } from "@/app/admin/_services/admin-api";
import { adminKeys } from "@/app/_lib/api/query-keys";

type Step = 1 | 2;

export default function EditBranchPage() {
  const params = useParams<{ id: string }>();
  const branchId = params?.id ?? "";

  if (!branchId) {
    return (
      <Alert color="red" title="Invalid branch">
        Missing branch id in the URL.
      </Alert>
    );
  }

  return <EditBranchPageInner key={branchId} branchId={branchId} />;
}

function EditBranchPageInner({ branchId }: { branchId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { branch, isLoading: isBranchLoading, isError: isBranchError, error } =
    useBranchDetails(branchId);

  const {
    states,
    isLoading: isStatesLoading,
    isError: isStatesError,
    error: statesError,
  } = useOutletStates();
  const hasStateOptions = states.length > 0;

  const {
    agentOptions,
    agents,
    isLoading: isAgentsLoading,
    isError: isAgentsError,
    error: agentsError,
  } = useAgentsAll();

  // Step 1: Basic Branch Information
  const [step, setStep] = useState<Step>(1);
  const [branchName, setBranchName] = useState("");
  const [state, setState] = useState<string | null>(null);
  const [branchManager, setBranchManager] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [branchEmail, setBranchEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Step 2: Select agent
  const [agentId, setAgentId] = useState<string | null>(null);
  const selectedAgent = useMemo(
    () => agents?.find((agent) => agent.id === agentId) ?? null,
    [agents, agentId]
  );

  const hasShownStateErrorRef = useRef(false);
  const hasShownAgentsErrorRef = useRef(false);
  const hasPrefilledBaseRef = useRef(false);
  const hasPrefilledAgentRef = useRef(false);

  useEffect(() => {
    if (!isStatesError) {
      hasShownStateErrorRef.current = false;
      return;
    }

    if (hasShownStateErrorRef.current) return;

    notifications.show({
      title: "Unable to Load States",
      message:
        statesError?.message ??
        "States could not be fetched. You cannot edit a branch until states are available.",
      color: "red",
    });

    hasShownStateErrorRef.current = true;
  }, [isStatesError, statesError?.message]);

  useEffect(() => {
    if (!isAgentsError) {
      hasShownAgentsErrorRef.current = false;
      return;
    }

    if (hasShownAgentsErrorRef.current) return;

    notifications.show({
      title: "Unable to Load Agents",
      message:
        agentsError?.message ?? "Agents could not be fetched. Please try again later.",
      color: "red",
    });

    hasShownAgentsErrorRef.current = true;
  }, [isAgentsError, agentsError?.message]);

  // Prefill step-1 fields from branch details
  useEffect(() => {
    if (!branch || hasPrefilledBaseRef.current) return;

    hasPrefilledBaseRef.current = true;
    queueMicrotask(() => {
      setBranchName(branch.name ?? "");
      setState(branch.state ?? null);
      setBranchManager(branch.branchManager ?? "");
      setManagerEmail(branch.email ?? "");
      setBranchEmail(branch.branchEmail ?? "");
      setAddress(branch.address ?? "");
      setPhoneNumber(branch.phoneNumber ?? "");
    });

  }, [branch]);

  // Prefill agent from branch details once agents are loaded
  useEffect(() => {
    if (!branch || !agents || agents.length === 0 || hasPrefilledAgentRef.current) return;

    const match =
      (branch.agentEmail
        ? agents.find((a) => a.email === branch.agentEmail)
        : null) ??
      (branch.agentPhoneNumber
        ? agents.find((a) => a.phoneNumber === branch.agentPhoneNumber)
        : null) ??
      (branch.agentName ? agents.find((a) => a.name === branch.agentName) : null) ??
      null;

    hasPrefilledAgentRef.current = true;
    queueMicrotask(() => {
      setAgentId(match ? match.id : null);
    });
  }, [branch, agents]);

  const isStep1Valid = useMemo(
    () =>
      branchName.trim().length > 0 &&
      !!state &&
      branchManager.trim().length > 0 &&
      managerEmail.trim().length > 0 &&
      branchEmail.trim().length > 0 &&
      address.trim().length > 0 &&
      phoneNumber.trim().length > 0,
    [address, branchEmail, branchManager, branchName, managerEmail, phoneNumber, state]
  );

  const buildPayload = (): CreateBranchPayload | null => {
    if (!state || !selectedAgent) return null;

    return {
      branchName: branchName.trim(),
      branchEmail: branchEmail.trim(),
      state,
      address: address.trim(),
      branchManager: branchManager.trim(),
      email: managerEmail.trim(),
      phoneNumber: phoneNumber.trim(),
      agentName: selectedAgent.name,
      agentEmail: selectedAgent.email,
      agentId: selectedAgent.id,
      agentPhoneNumber: selectedAgent.phoneNumber,
    };
  };

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const updateBranchMutation = usePutData(
    (payload: CreateBranchPayload) => adminApi.outlet.branches.update(branchId, payload),
    {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.outlet.branches.detail(branchId)],
          }),
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.outlet.branches.all()],
          }),
        ]);

        setIsConfirmOpen(false);
        setIsSuccessOpen(true);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse | undefined;
        notifications.show({
          title: "Update Branch Failed",
          message:
            apiResponse?.error?.message ??
            apiResponse?.message ??
            (error as Error)?.message ??
            "Unable to update branch. Please try again.",
          color: "red",
        });

        setIsConfirmOpen(false);
      },
    }
  );

  const handleCancel = () => {
    router.push(adminRoutes.adminOutletBranchDetails(branchId));
  };

  const handleNext = () => {
    if (isStatesError || !hasStateOptions) {
      notifications.show({
        title: "State Required",
        message:
          "Unable to load state options. Please try again later.",
        color: "red",
      });
      return;
    }

    if (!isStep1Valid) {
      notifications.show({
        title: "Incomplete Form",
        message: "Please complete all required fields before proceeding.",
        color: "red",
      });
      return;
    }

    setStep(2);
  };

  const handleCreateBranchClick = () => {
    if (isStatesError || !hasStateOptions) {
      notifications.show({
        title: "State Required",
        message:
          "Unable to load state options. Please try again later.",
        color: "red",
      });
      return;
    }

    if (!isStep1Valid) {
      notifications.show({
        title: "Incomplete Form",
        message: "Please complete all required fields before saving.",
        color: "red",
      });
      return;
    }

    if (isAgentsError) {
      notifications.show({
        title: "Unable to Load Agents",
        message: "Agents could not be fetched. Please try again later.",
        color: "red",
      });
      return;
    }

    if (!selectedAgent) {
      notifications.show({
        title: "Agent Required",
        message: "Please select an agent before saving the branch.",
        color: "red",
      });
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    if (updateBranchMutation.isPending) return;

    const payload = buildPayload();
    if (!payload) return;

    updateBranchMutation.mutate(payload);
  };

  const handleManageBranch = () => {
    setIsSuccessOpen(false);
    router.push(adminRoutes.adminOutletBranchDetails(branchId));
  };

  if (isBranchLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl bg-white shadow-sm p-6 md:p-8 space-y-4">
          <Text className="text-gray-600">Loading branch details...</Text>
        </div>
      </div>
    );
  }

  if (isBranchError) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl bg-white shadow-sm p-6 md:p-8">
          <Alert color="red" title="Could not load branch">
            {error?.message ?? "Unable to load branch details. Please try again."}
          </Alert>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl bg-white shadow-sm p-6 md:p-8">
          <Text c="dimmed" size="sm">
            No branch data found.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl bg-white shadow-sm p-6 md:p-8">
        {/* Progress Tracker */}
        <div className="mb-8">
          <div className="relative flex items-center justify-between px-2">
            <div
              className={`absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 ${
                step === 2 ? "bg-orange-500" : "bg-gray-200"
              }`}
            />
            <div className="relative z-10 flex flex-col items-start">
              {step === 2 ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-orange-500 bg-white" />
              )}
            </div>
            <div className="relative z-10 flex flex-col items-end">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  step === 2 ? "bg-orange-500" : "bg-gray-300"
                }`}
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between px-1 text-xs font-medium">
            <span className="text-orange-500">Branch Information</span>
            <span className={step === 2 ? "text-orange-500" : "text-gray-500"}>
              Assign Agent
            </span>
          </div>
        </div>

        {step === 1 ? (
          <>
            <div className="text-center mb-8">
              <Text className="text-xl! font-bold! text-gray-900!" mb={4}>
                Edit Branch Information
              </Text>
              <Text className="text-base! font-normal! text-gray-600!">
                Update the branch details to match the latest information
              </Text>
            </div>

            <Stack gap="lg">
              <TextInput
                label="Branch Name"
                placeholder="e.g. Yaba"
                value={branchName}
                onChange={(e) => setBranchName(e.currentTarget.value)}
                required
                radius="md"
              />

              <Group grow align="flex-start">
                <Select
                  label="State"
                  placeholder={isStatesLoading ? "Loading states..." : "Select state"}
                  data={states}
                  value={state}
                  onChange={setState}
                  required
                  radius="md"
                  searchable
                  clearable
                  disabled={isStatesLoading || !hasStateOptions}
                  error={
                    isStatesError ? "Unable to load states. Please try again later." : undefined
                  }
                />

                <TextInput
                  label="Branch Manager"
                  placeholder="e.g. Bashorun Dauda"
                  value={branchManager}
                  onChange={(e) => setBranchManager(e.currentTarget.value)}
                  required
                  radius="md"
                />
              </Group>

              <Group grow align="flex-start">
                <TextInput
                  label="Email Address"
                  placeholder="e.g. bashorun@sohcahtoa.com"
                  description="For manager"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.currentTarget.value)}
                  type="email"
                  required
                  radius="md"
                />
                <TextInput
                  label="Email Address"
                  placeholder="e.g. yababranch@sohcahtoa.com"
                  description="For branch"
                  value={branchEmail}
                  onChange={(e) => setBranchEmail(e.currentTarget.value)}
                  type="email"
                  required
                  radius="md"
                />
              </Group>

              <TextInput
                label="Address"
                placeholder="e.g. No 14, Unilag Rd, Yaba Lagos."
                value={address}
                onChange={(e) => setAddress(e.currentTarget.value)}
                required
                radius="md"
              />

              <TextInput
                label="Phone Number"
                placeholder="e.g. +234 8138989206"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.currentTarget.value)}
                required
                radius="md"
              />
            </Stack>

            <Group justify="center" wrap="nowrap" gap="sm" mt="xl">
              <CustomButton
                fullWidth
                size="md"
                buttonType="secondary"
                onClick={handleCancel}
              >
                Cancel
              </CustomButton>
              <CustomButton
                fullWidth
                size="md"
                buttonType="primary"
                onClick={handleNext}
                disabled={isStatesLoading || isStatesError}
              >
                Next
              </CustomButton>
            </Group>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <Text className="text-xl! font-bold! text-gray-900!" mb={4}>
                Assign Agent to Branch
              </Text>
              <Text className="text-base! font-normal! text-gray-600!">
                Select an agent and review the contact details
              </Text>
            </div>

            <Stack gap="lg">
              <Select
                label="Agent"
                placeholder={isAgentsLoading ? "Loading agents..." : "Select an agent"}
                data={agentOptions}
                value={agentId}
                onChange={setAgentId}
                required
                radius="md"
                searchable
                disabled={isAgentsLoading || isAgentsError || agentOptions.length === 0}
                error={
                  isAgentsError ? "Unable to load agents. Please try again later." : undefined
                }
              />

              <Group grow align="flex-start">
                <TextInput
                  label="Agent Email"
                  placeholder={selectedAgent ? "" : "Select an agent"}
                  value={selectedAgent?.email ?? ""}
                  disabled
                  radius="md"
                />
                <TextInput
                  label="Agent Phone Number"
                  placeholder={selectedAgent ? "" : "Select an agent"}
                  value={selectedAgent?.phoneNumber ?? ""}
                  disabled
                  radius="md"
                />
              </Group>
            </Stack>

            <Group justify="center" wrap="nowrap" gap="sm" mt="xl">
              <CustomButton
                fullWidth
                size="md"
                buttonType="secondary"
                onClick={() => setStep(1)}
              >
                Back
              </CustomButton>
              <CustomButton
                fullWidth
                size="md"
                buttonType="primary"
                onClick={handleCreateBranchClick}
                disabled={
                  updateBranchMutation.isPending ||
                  isAgentsLoading ||
                  isAgentsError ||
                  !selectedAgent
                }
              >
                Save Changes
              </CustomButton>
            </Group>
          </>
        )}

        <ConfirmationModal
          opened={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          title="Save Changes ?"
          message="Are you sure you want to save these changes? The new data will override the existing branch details."
          primaryButtonText="Yes, Save"
          secondaryButtonText="No, Close"
          onPrimary={handleConfirmSave}
          onSecondary={() => setIsConfirmOpen(false)}
          loading={updateBranchMutation.isPending}
        />

        <SuccessModal
          opened={isSuccessOpen}
          onClose={() => setIsSuccessOpen(false)}
          title="Branch Updated"
          message="Branch details have been successfully updated."
          primaryButtonText="View Branch Details"
          onPrimaryClick={handleManageBranch}
        />
      </div>
    </div>
  );
}