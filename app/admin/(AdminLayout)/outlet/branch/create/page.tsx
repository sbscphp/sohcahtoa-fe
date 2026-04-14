"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stack, Text, TextInput, Select, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Check } from "lucide-react";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { adminRoutes } from "@/lib/adminRoutes";
import { notifications } from "@mantine/notifications";
import { useCreateData } from "@/app/_lib/api/hooks";
import {
  adminApi,
  type CreateBranchPayload,
} from "@/app/admin/_services/admin-api";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useOutletStates } from "../../hooks/useOutletStates";
import { useAgentsAll } from "../../hooks/useAgentsAll";

type FormValues = {
  branchName: string;
  state: string | null;
  branchManager: string;
  managerEmail: string;
  branchEmail: string;
  address: string;
  phoneNumber: string;
  agentId: string | null;
};

export default function CreateBranchPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const form = useForm<FormValues>({
    initialValues: {
      branchName: "",
      state: "",
      branchManager: "",
      managerEmail: "",
      branchEmail: "",
      address: "",
      phoneNumber: "",
      agentId: null,
    },
    validate: {
      branchName: (v) => (v.trim().length >= 2 ? null : "Branch name is too short"),
      state: (v) => (v ? null : "State is required"),
      branchManager: (v) => (v.trim().length >= 3 ? null : "Manager name is required"),
      managerEmail: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : "Invalid manager email"),
      branchEmail: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : "Invalid branch email"),
      address: (v) => (v.trim().length >= 5 ? null : "Full address is required"),
      phoneNumber: (v) => (/^\+234\d{10}$/.test(v.trim()) ? null : "Use format +2348031234567"),
    },
  });
  const handleCreateBranchClick = () => {
  // 1. Run full form validation
  const validation = form.validate();
  if (validation.hasErrors) {
    notifications.show({
      title: "Validation Error",
      message: "Please select an agent and ensure all fields are correct.",
      color: "red",
    });
    return;
  }

  if (!selectedAgent) {
    notifications.show({
      title: "Agent Required",
      message: "Please select a valid agent from the list.",
      color: "red",
    });
    return;
  }
  setIsConfirmOpen(true);
};

  const {
    states,
    isLoading: isStatesLoading,
    isError: isStatesError,
  } = useOutletStates();
  const {
    agentOptions,
    agents,
    isLoading: isAgentsLoading,
    isError: isAgentsError,
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
    },
    onError: (error) => {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse;
      notifications.show({
        title: "Error",
        message: apiResponse?.error?.message ?? "Failed to create branch",
        color: "red",
      });
    },
  });

  const handleNext = () => {
  const step1Fields = [
    "branchName",
    "state",
    "branchManager",
    "managerEmail",
    "branchEmail",
    "address",
    "phoneNumber",
  ];

  let hasStep1Errors = false;
  step1Fields.forEach((field) => {
    const error = form.validateField(field as keyof FormValues);
    if (error.hasError) hasStep1Errors = true;
  });

  if (hasStep1Errors) {
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

  // Prevent invalid characters in phone
  const handlePhoneKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9+]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab") {
      e.preventDefault();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl bg-white shadow-sm p-6 md:p-8">
        {/* Progress Tracker UI */}
        <div className="mb-10">
          <div className="relative flex items-center justify-between px-2">
            <div
              className={`absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 ${step === 2 ? "bg-orange-500" : "bg-gray-200"}`}
            />
            <div
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full ${step === 2 ? "bg-orange-500" : "border-2 border-orange-500 bg-white"}`}
            >
              {step === 2 && (
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              )}
            </div>
            <div
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full ${step === 2 ? "bg-orange-500" : "bg-gray-300"}`}
            />
          </div>
          <div className="mt-2 flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wider">
            <span className="text-orange-600">Branch Info</span>
            <span className={step === 2 ? "text-orange-600" : "text-gray-400"}>
              Add Agents
            </span>
          </div>
        </div>

        {step === 1 ? (
          <Stack gap="lg">
            <div className="text-center mb-4">
              <Text fw={700} size="xl">
                Branch Information
              </Text>
              <Text size="sm" c="dimmed">
                Provide core details for the new location
              </Text>
            </div>

            <TextInput
              label="Branch Name"
              placeholder="e.g. Ikeja Branch"
              required
              {...form.getInputProps("branchName")}
            />

            <Group grow align="flex-start">
              <Select
                label="State"
                placeholder="Select State"
                data={states}
                required
                searchable
                {...form.getInputProps("state")}
              />
              <TextInput
                label="Branch Manager"
                placeholder="Full Name"
                required
                {...form.getInputProps("branchManager")}
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
              placeholder="Street Address"
              required
              {...form.getInputProps("address")}
            />

            <TextInput
              label="Phone Number"
              placeholder="+2348000000000"
              required
              maxLength={14}
              onKeyDown={handlePhoneKeyPress}
              {...form.getInputProps("phoneNumber")}
            />

            <Group justify="center" mt="xl">
              <CustomButton
                buttonType="secondary"
                onClick={() => router.back()}
                className="w-40"
              >
                Cancel
              </CustomButton>
              <CustomButton
                buttonType="primary"
                onClick={handleNext}
                className="w-40"
              >
                Next Step
              </CustomButton>
            </Group>
          </Stack>
        ) : (
          <Stack gap="lg">
            <div className="text-center mb-4">
              <Text fw={700} size="xl">
                Assign Agent
              </Text>
              <Text size="sm" c="dimmed">
                Select an agent to manage this branch
              </Text>
            </div>

            <Select
              label="Select Agent"
              placeholder={isAgentsLoading ? "Loading..." : "Search Agents"}
              data={agentOptions}
              required
              searchable
              disabled={isAgentsLoading}
              {...form.getInputProps("agentId")}
            />

            {selectedAgent && (
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <Text size="xs" c="dimmed" fw={600}>
                    AGENT EMAIL
                  </Text>
                  <Text size="sm" fw={500}>
                    {selectedAgent.email}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed" fw={600}>
                    PHONE NUMBER
                  </Text>
                  <Text size="sm" fw={500}>
                    {selectedAgent.phoneNumber}
                  </Text>
                </div>
              </div>
            )}

            <Group justify="center" mt="xl">
              <CustomButton
                buttonType="secondary"
                onClick={() => setStep(1)}
                className="w-40"
              >
                Back
              </CustomButton>
              <CustomButton
                buttonType="primary"
                onClick={handleCreateBranchClick}
                className="w-40"
                loading={createBranchMutation.isPending}
                disabled={createBranchMutation.isError}
              >
                Create Branch
              </CustomButton>
            </Group>
          </Stack>
        )}
      </div>

      <ConfirmationModal
        opened={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Create Branch?"
        message="Confirmation invites will be sent to the manager and assigned agent."
        primaryButtonText="Yes, Create"
        onPrimary={handleConfirmCreate}
        loading={createBranchMutation.isPending}
      />

      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => router.push(adminRoutes.adminOutlet())}
        title="Branch Created"
        message="The new branch has been added to the system successfully."
        primaryButtonText="Back to Outlets"
        onPrimaryClick={() => router.push(adminRoutes.adminOutlet())}
      />
    </div>
  );
}
