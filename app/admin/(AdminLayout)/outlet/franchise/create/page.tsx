"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Stack, Text, TextInput, Select, Group } from "@mantine/core";
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
  const [franchiseName, setFranchiseName] = useState("");
  const [state, setState] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber1, setPhoneNumber1] = useState("");
  const [phoneNumber2, setPhoneNumber2] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const hasShownStateErrorRef = useRef(false);

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
    if (!isStatesError) {
      hasShownStateErrorRef.current = false;
      return;
    }

    if (hasShownStateErrorRef.current) {
      return;
    }

    notifications.show({
      title: "Unable to Load States",
      message:
        statesError?.message ??
        "States could not be fetched. You cannot create a franchise until states are available.",
      color: "red",
    });
    hasShownStateErrorRef.current = true;
  }, [isStatesError, statesError?.message]);

  const createFranchiseMutation = useCreateData(adminApi.outlet.franchises.create, {
    onSuccess: (response) => {
      const apiResponse = response as ApiResponse<{ message?: string }>;
      notifications.show({
        title: "Franchise Created",
        message:
          apiResponse?.message ??
          apiResponse?.data?.message ??
          "Franchise successfully created.",
        color: "green",
      });
      setIsConfirmOpen(false);
      setIsSuccessOpen(true);
    },
    onError: (error) => {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse;
      notifications.show({
        title: "Create Franchise Failed",
        message:
          apiResponse?.error?.message ??
          error.message ??
          "Unable to create franchise. Please try again.",
        color: "red",
      });
    },
  });

  const handleCancel = () => {
    router.push(adminRoutes.adminOutlet());
  };

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
        message: "Please complete all required fields before proceeding.",
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

  const handleManageFranchise = () => {
    setIsSuccessOpen(false);
    router.push(adminRoutes.adminOutlet());
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
            value={franchiseName}
            onChange={(e) => setFranchiseName(e.currentTarget.value)}
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
                isStatesError
                  ? "Unable to load states. Please try again later."
                  : undefined
              }
            />
            <TextInput
              label="Address"
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.currentTarget.value)}
              required
              radius="md"
            />
          </Group>

          <TextInput
            label="Contact Person Name"
            placeholder="e.g. Adekunle, Ibrahim Olamide"
            value={contactPersonName}
            onChange={(e) => setContactPersonName(e.currentTarget.value)}
            required
            radius="md"
          />

          <TextInput
            label="Email Address"
            placeholder="e.g. olamide@sohcahtoa.com"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.currentTarget.value)}
            type="email"
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
              placeholder="+234 90 4747 2791"
              value={phoneNumber1}
              onChange={(e) => setPhoneNumber1(e.currentTarget.value)}
              required
              radius="md"
            />
            <TextInput
              label="Phone Number 2 (optional)"
              placeholder="+234 00 0000 0000"
              value={phoneNumber2}
              onChange={(e) => setPhoneNumber2(e.currentTarget.value)}
              radius="md"
            />
          </Group>
        </Stack>

        <Group justify="center" wrap="nowrap" gap="sm" mt="xl">
          <CustomButton
            fullWidth
            size="md"
            buttonType="secondary"
            onClick={handleCancel}
            disabled={createFranchiseMutation.isPending}
          >
            Cancel
          </CustomButton>
          <CustomButton
            fullWidth
            size="md"
            buttonType="primary"
            onClick={handleCreateFranchiseClick}
            disabled={
              createFranchiseMutation.isPending ||
              isStatesLoading ||
              !hasStateOptions ||
              !isFormValid
            }
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
        onSecondary={() => setIsConfirmOpen(false)}
        loading={createFranchiseMutation.isPending}
      />

      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Franchise Created"
        message="Franchise successfully created. An email for onboarding will be sent to the franchise created."
        primaryButtonText="Manage Franchise"
        onPrimaryClick={handleManageFranchise}
      />
    </div>
  );
}
