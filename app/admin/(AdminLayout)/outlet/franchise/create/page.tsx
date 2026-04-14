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
  const trimmedEmail = emailAddress.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

  const isFormValid = useMemo(
    () =>
      franchiseName.trim().length > 0 &&
      !!state &&
      address.trim().length > 0 &&
      contactPersonName.trim().length > 0 &&
      trimmedEmail.length > 0 &&
      isEmailValid &&
      phoneNumber1.trim().length > 0,
    [
      address,
      contactPersonName,
      franchiseName,
      isEmailValid,
      phoneNumber1,
      state,
      trimmedEmail,
    ]
  );

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
    if (!hasStateOptions) {
      notifications.show({
        title: "State Required",
        message:
          "State options are unavailable. Please try again when states are loaded.",
        color: "red",
      });
      return;
    }

    if (!isFormValid) {
      if (trimmedEmail.length > 0 && !isEmailValid) {
        notifications.show({
          title: "Invalid Email Address",
          message: "Enter a valid email address before proceeding.",
          color: "red",
        });
        return;
      }

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
    if (!state || !hasStateOptions) {
      notifications.show({
        title: "State Required",
        message: "Select a valid state before creating a franchise.",
        color: "red",
      });
      return;
    }

    if (!isEmailValid) {
      notifications.show({
        title: "Invalid Email Address",
        message: "Enter a valid email address before creating a franchise.",
        color: "red",
      });
      return;
    }

    const payload: CreateFranchisePayload = {
      franchiseName: franchiseName.trim(),
      state,
      address: address.trim(),
      contactPersonName: contactPersonName.trim(),
      email: trimmedEmail,
      phoneNumber: phoneNumber1.trim(),
      altPhoneNumber: phoneNumber2.trim(),
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
            error={
              trimmedEmail.length > 0 && !isEmailValid
                ? "Enter a valid email address"
                : undefined
            }
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