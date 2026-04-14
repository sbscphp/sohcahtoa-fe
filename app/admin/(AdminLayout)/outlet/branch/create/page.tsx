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

  const selectedAgent = agents?.find((agent) => agent.id === form.values.agentId) ?? null;

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
      title: "Incomplete Form",
      message: "Please fix the errors in Step 1 before proceeding.",
      color: "red",
    });
    return;
  }
  
  setStep(2);
};


  const handleConfirmCreate = () => {
    if (!selectedAgent) return;

    const payload: CreateBranchPayload = {
      branchName: form.values.branchName.trim(),
      branchEmail: form.values.branchEmail.trim(),
      state: form.values.state!,
      address: form.values.address.trim(),
      branchManager: form.values.branchManager.trim(),
      email: form.values.managerEmail.trim(),
      phoneNumber: form.values.phoneNumber.trim(),
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
                label="Manager Email"
                placeholder="manager@company.com"
                required
                {...form.getInputProps("managerEmail")}
              />
              <TextInput
                label="Branch Public Email"
                placeholder="branch@company.com"
                required
                {...form.getInputProps("branchEmail")}
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
