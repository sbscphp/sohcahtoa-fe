"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Stack, Text, TextInput, Select, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { adminRoutes } from "@/lib/adminRoutes";
import { notifications } from "@mantine/notifications";
import { useCreateData } from "@/app/_lib/api/hooks";
import {
  adminApi,
  type CreateFranchisePayload,
} from "@/app/admin/_services/admin-api";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useOutletStates } from "../../hooks/useOutletStates";

export default function CreateFranchisePage() {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const hasShownStateErrorRef = useRef(false);

  // 2. Initialize Form with Zod Resolver
  const form = useForm({
    initialValues: {
      franchiseName: "",
      state: "",
      address: "",
      contactPersonName: "",
      emailAddress: "",
      phoneNumber1: "",
      phoneNumber2: "",
    },
    validate: {
      franchiseName: (v) => (v.trim().length ? null : "Franchise name is required"),
      state: (v) => (v ? null : "Please select a state"),
      address: (v) => (v.trim().length ? null : "Address is required"),
      contactPersonName: (v) => (v.trim().length ? null : "Contact person name is required"),
      emailAddress: (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : "Invalid email address",
      phoneNumber1: (v) =>
        /^\+234\d{10}$/.test(v.trim()) ? null : "Phone number must be in +234 format (e.g., +2348031234567)",
      phoneNumber2: (v) =>
        !v || /^\+234\d{10}$/.test(v.trim()) ? null : "Invalid +234 format",
    },
  });

  const {
    states,
    isLoading: isStatesLoading,
    isError: isStatesError,
    error: statesError,
  } = useOutletStates();

  const hasStateOptions = states.length > 0;

  useEffect(() => {
    if (isStatesError && !hasShownStateErrorRef.current) {
      notifications.show({
        title: "Unable to Load States",
        message: statesError?.message ?? "States could not be fetched.",
        color: "red",
      });
      hasShownStateErrorRef.current = true;
    }
  }, [isStatesError, statesError]);

  const createFranchiseMutation = useCreateData(adminApi.outlet.franchises.create, {
    onSuccess: (response) => {
      setIsConfirmOpen(false);
      setIsSuccessOpen(true);
    },
    onError: (error) => {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse;
      notifications.show({
        title: "Create Franchise Failed",
        message: apiResponse?.error?.message ?? "Unable to create franchise.",
        color: "red",
      });
    },
  });

  const handleCreateFranchiseClick = () => {
    // 3. Trigger Mantine Validation
    const validation = form.validate();
    if (validation.hasErrors) {
      notifications.show({
        title: "Incomplete Form",
        message: "Please correct the errors in the form before proceeding.",
        color: "red",
      });
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmCreate = () => {
    const payload: CreateFranchisePayload = {
      franchiseName: form.values.franchiseName.trim(),
      state: form.values.state,
      address: form.values.address.trim(),
      contactPersonName: form.values.contactPersonName.trim(),
      email: form.values.emailAddress.trim(),
      phoneNumber: form.values.phoneNumber1.trim(),
      altPhoneNumber: form.values.phoneNumber2.trim() || null,
    };

    createFranchiseMutation.mutate(payload);
  };

  const handlePhoneKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9+]/.test(e.key) && e.key !== "Backspace" && e.key !== "Tab") {
      e.preventDefault();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl bg-white shadow-sm p-6 md:p-8">
        <div className="text-center mb-8">
          <Text className="text-xl! font-bold! text-gray-900!" mb={4}>
            Fill in Required Information
          </Text>
          <Text className="text-base! font-normal! text-gray-600!">
            Enter the necessary fields to create a new franchise
          </Text>
        </div>

        <Stack gap="lg">
          <TextInput
            label="Franchise Name"
            placeholder="e.g. Sterling Exchange"
            required
            radius="md"
            {...form.getInputProps("franchiseName")}
          />

          <Group grow align="flex-start">
            <Select
              label="State"
              placeholder={isStatesLoading ? "Loading..." : "Select state"}
              data={states}
              required
              radius="md"
              searchable
              disabled={isStatesLoading || !hasStateOptions}
              {...form.getInputProps("state")}
            />
            <TextInput
              label="Address"
              placeholder="Enter address"
              required
              radius="md"
              {...form.getInputProps("address")}
            />
          </Group>

          <TextInput
            label="Contact Person Name"
            placeholder="e.g. Adekunle, Ibrahim Olamide"
            required
            radius="md"
            {...form.getInputProps("contactPersonName")}
          />

          <TextInput
            label="Email Address"
            placeholder="e.g. olamide@sohcahtoa.com"
            required
            radius="md"
            {...form.getInputProps("emailAddress")}
          />

          <Group grow align="flex-start">
            <TextInput
              label="Phone Number 1"
              placeholder="+2348031234567"
              required
              radius="md"
              maxLength={14}
              onKeyDown={handlePhoneKeyPress}
              {...form.getInputProps("phoneNumber1")}
            />
            <TextInput
              label="Phone Number 2 (optional)"
              placeholder="+2348031234567"
              radius="md"
              maxLength={14}
              onKeyDown={handlePhoneKeyPress}
              {...form.getInputProps("phoneNumber2")}
            />
          </Group>
        </Stack>

        <Group justify="center" wrap="nowrap" gap="sm" mt="xl">
          <CustomButton
            fullWidth
            size="md"
            buttonType="secondary"
            onClick={() => router.push(adminRoutes.adminOutlet())}
          >
            Cancel
          </CustomButton>
          <CustomButton
            fullWidth
            size="md"
            buttonType="primary"
            onClick={handleCreateFranchiseClick}
            disabled={createFranchiseMutation.isPending || isStatesLoading}
          >
            Create Franchise
          </CustomButton>
        </Group>
      </div>

      <ConfirmationModal
        opened={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Create a Franchise ?"
        message="Are you sure you want to create this franchise? An invite will be sent to the email address."
        primaryButtonText="Yes, Create"
        secondaryButtonText="No, Close"
        onPrimary={handleConfirmCreate}
        loading={createFranchiseMutation.isPending}
      />

      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Franchise Created"
        message="Franchise successfully created. An email for onboarding will be sent."
        primaryButtonText="Manage Franchise"
        onPrimaryClick={() => router.push(adminRoutes.adminOutlet())}
      />
    </div>
  );
}