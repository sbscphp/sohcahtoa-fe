"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Stack, Text, TextInput, Select, Group } from "@mantine/core";
import { Check } from "lucide-react";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { adminRoutes } from "@/lib/adminRoutes";
import { notifications } from "@mantine/notifications";
import { useCreateData } from "@/app/_lib/api/hooks";
import { adminApi, type CreateBranchPayload } from "@/app/admin/_services/admin-api";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useOutletStates } from "../../hooks/useOutletStates";
import { useAgentsAll } from "../../hooks/useAgentsAll";

export default function CreateBranchPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Basic Branch Information
  const [branchName, setBranchName] = useState("");
  const [state, setState] = useState<string | null>(null);
  const [branchManager, setBranchManager] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [branchEmail, setBranchEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

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

  // Step 2: Add Agents
  const [agentId, setAgentId] = useState<string | null>(null);
  const selectedAgent = useMemo(
    () => agents?.find((agent) => agent.id === agentId) ?? null,
    [agents, agentId]
  );

  const hasShownStateErrorRef = useRef(false);
  const hasShownAgentsErrorRef = useRef(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const trimmedManagerEmail = managerEmail.trim();
  const trimmedBranchEmail = branchEmail.trim();
  const isManagerEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedManagerEmail);
  const isBranchEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedBranchEmail);

  const isStep1Valid = useMemo(
    () =>
      branchName.trim().length > 0 &&
      !!state &&
      branchManager.trim().length > 0 &&
      trimmedManagerEmail.length > 0 &&
      isManagerEmailValid &&
      trimmedBranchEmail.length > 0 &&
      isBranchEmailValid &&
      address.trim().length > 0 &&
      phoneNumber.trim().length > 0,
    [
      address,
      branchManager,
      branchName,
      isBranchEmailValid,
      isManagerEmailValid,
      phoneNumber,
      state,
      trimmedBranchEmail,
      trimmedManagerEmail,
    ]
  );

  const createBranchMutation = useCreateData(adminApi.outlet.branches.create, {
    onSuccess: () => {
      setIsConfirmOpen(false);
      setIsSuccessOpen(true);
      notifications.show({
        title: "Branch Created",
        message: "Branch was created successfully.",
        color: "green",
      });
    },
    onError: (error) => {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse;
      notifications.show({
        title: "Create Branch Failed",
        message:
          apiResponse?.error?.message ??
          error.message ??
          "Unable to create branch. Please try again.",
        color: "red",
      });
    },
  });

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
        "States could not be fetched. You cannot create a branch until states are available.",
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

  const handleCancel = () => {
    router.push(adminRoutes.adminOutlet());
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
      if (
        (trimmedManagerEmail.length > 0 && !isManagerEmailValid) ||
        (trimmedBranchEmail.length > 0 && !isBranchEmailValid)
      ) {
        notifications.show({
          title: "Invalid Email Address",
          message: "Enter valid manager and branch email addresses before proceeding.",
          color: "red",
        });
        return;
      }

      notifications.show({
        title: "Incomplete Form",
        message: "Please complete all required fields before proceeding.",
        color: "red",
      });
      return;
    }

    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
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
      if (
        (trimmedManagerEmail.length > 0 && !isManagerEmailValid) ||
        (trimmedBranchEmail.length > 0 && !isBranchEmailValid)
      ) {
        notifications.show({
          title: "Invalid Email Address",
          message: "Enter valid manager and branch email addresses before creating the branch.",
          color: "red",
        });
        return;
      }

      notifications.show({
        title: "Incomplete Form",
        message: "Please complete all required fields before creating the branch.",
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
        message: "Please select an agent before creating the branch.",
        color: "red",
      });
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmCreate = () => {
    if (!state || !selectedAgent || createBranchMutation.isPending) return;
    if (!isManagerEmailValid || !isBranchEmailValid) {
      notifications.show({
        title: "Invalid Email Address",
        message: "Enter valid manager and branch email addresses before creating the branch.",
        color: "red",
      });
      return;
    }

    const payload: CreateBranchPayload = {
      branchName: branchName.trim(),
      branchEmail: trimmedBranchEmail,
      state,
      address: address.trim(),
      branchManager: branchManager.trim(),
      email: trimmedManagerEmail,
      phoneNumber: phoneNumber.trim(),
      agentName: selectedAgent.name,
      agentEmail: selectedAgent.email,
      agentId: selectedAgent.id,
      agentPhoneNumber: selectedAgent.phoneNumber,
    };

    createBranchMutation.mutate(payload);
  };

  const handleManageBranch = () => {
    setIsSuccessOpen(false);
    router.push(adminRoutes.adminOutlet());
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl bg-white shadow-sm p-6 md:p-8">
        {/* Progress Tracker - matches design */}
        <div className="mb-8">
          <div className="relative flex items-center justify-between px-2">
            {/* Connecting line */}
            <div
              className={`absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 ${
                step === 2 ? "bg-orange-500" : "bg-gray-200"
              }`}
            />

            {/* Left step: Basic Branch Information */}
            <div className="relative z-10 flex flex-col items-start">
              {step === 2 ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-orange-500 bg-white" />
              )}
            </div>

            {/* Right step: Add Agents */}
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
            <span className="text-orange-500">Basic Branch Information</span>
            <span className={step === 2 ? "text-orange-500" : "text-gray-500"}>
              Add Agents
            </span>
          </div>
        </div>

        {step === 1 ? (
          <>
            <div className="text-center mb-8">
              <Text className="text-xl! font-bold! text-gray-900!" mb={4}>
                Fill in Branch Information
              </Text>
              <Text className="text-base! font-normal! text-gray-600!">
                Enter the necessary fields to create a new Sohcahtoa branch
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
                  error={
                    trimmedManagerEmail.length > 0 && !isManagerEmailValid
                      ? "Enter a valid email address"
                      : undefined
                  }
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
                  error={
                    trimmedBranchEmail.length > 0 && !isBranchEmailValid
                      ? "Enter a valid email address"
                      : undefined
                  }
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
                disabled={isStatesLoading || !hasStateOptions}
              >
                Next
              </CustomButton>
            </Group>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <Text className="text-xl! font-bold! text-gray-900!" mb={4}>
                Add Agents to Branch
              </Text>
              <Text className="text-base! font-normal! text-gray-600!">
                Fill out the information to add an agent
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
                clearable={false}
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
                onClick={handleBack}
              >
                Back
              </CustomButton>
              <CustomButton
                fullWidth
                size="md"
                buttonType="primary"
                onClick={handleCreateBranchClick}
                disabled={createBranchMutation.isPending || isAgentsLoading || isAgentsError || !selectedAgent}
              >
                Create Branch
              </CustomButton>
            </Group>
          </>
        )}
      </div>

      <ConfirmationModal
        opened={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Create a Branch ?"
        message="Are you sure you want to create this Branch? An invite will be sent to the branch email, branch manager and agents added."
        primaryButtonText="Yes, Create"
        secondaryButtonText="No, Close"
        onPrimary={handleConfirmCreate}
        onSecondary={() => setIsConfirmOpen(false)}
        loading={createBranchMutation.isPending}
      />

      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Branch Created"
        message="Branch successfully created. Agents can now be added to branches."
        primaryButtonText="Manage Branch"
        onPrimaryClick={handleManageBranch}
      />
    </div>
  );
}
