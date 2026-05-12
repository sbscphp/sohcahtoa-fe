"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stack, Text, Select, Group, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import FileUpload from "@/app/admin/_components/FileUpload";
import CustomerSelectModal, {
  type CustomerOption,
} from "../_ticketsComponents/CustomerSelectModal";
import { adminRoutes } from "@/lib/adminRoutes";
import { useTicketCaseTypes } from "../hooks/useTicketCaseTypes";
import { useCreateData } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { notifications } from "@mantine/notifications";
import { type ApiError, type ApiResponse } from "@/app/_lib/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/app/_lib/api/query-keys";

const PRIORITY_OPTIONS = [
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const FILE_INPUT_ID = "file-input-Attachment";

type TicketFormValues = {
  customer: CustomerOption | null;
  caseType: string;
  priorityLevel: string;
  description: string;
  attachment: File | null;
};

export default function CreateTicketPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    options: caseTypeOptions,
    isLoading: isCaseTypesLoading,
    isError: isCaseTypesError,
  } = useTicketCaseTypes();

  const form = useForm<TicketFormValues>({
    initialValues: {
      customer: null,
      caseType: "",
      priorityLevel: "",
      description: "",
      attachment: null,
    },
    validate: {
      customer: (value) =>
        value ? null : "Customer is required",
      caseType: (value) =>
        value ? null : "Case type is required",
      priorityLevel: (value) =>
        value ? null : "Priority level is required",
      description: (value) =>
        value.trim().length > 0
          ? null
          : "Description is required",
      attachment: (value) =>
        value ? null : "Attachment is required",
    },
  });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const createTicketMutation = useCreateData(adminApi.tickets.create, {
    onSuccess: async () => {
      setIsConfirmOpen(false);
      setIsSuccessOpen(true);
      form.reset();

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...adminKeys.tickets.all],
        }),
        queryClient.invalidateQueries({
          queryKey: [...adminKeys.tickets.stats()],
        }),
      ]);
    },
    onError: (error) => {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse;

      notifications.show({
        title: "Create Incident Failed",
        message:
          apiResponse?.error?.message ??
          error.message ??
          "Unable to create incident. Please try again.",
        color: "red",
      });
    },
  });

  const handleCancel = () => {
    router.push(adminRoutes.adminTickets());
  };

  const handleCreateIncidentClick = () => {
    const result = form.validate();
    if (result.hasErrors) {
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmCreate = async () => {
    if (!form.values.customer || !form.values.attachment) {
      return;
    }

    const payload = new FormData();
    payload.append("customer", form.values.customer.id);
    payload.append("caseType", form.values.caseType);
    payload.append("priorityLevel", form.values.priorityLevel);
    payload.append("description", form.values.description.trim());
    payload.append("file", form.values.attachment);

    createTicketMutation.mutate(payload);
  };

  const handleManageIncident = () => {
    setIsSuccessOpen(false);
    router.push(adminRoutes.adminTickets());
  };

  const handleAddAttachment = () => {
    document.getElementById(FILE_INPUT_ID)?.click();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl bg-white shadow-sm p-6 md:p-8">
        <div className="mb-8">
          <Text className="text-xl! font-bold! text-gray-900!" mb={4}>
            Ticket Details
          </Text>
          <Text className="text-base! font-normal! text-gray-600!">
            Fill out the basic information of the incident
          </Text>
        </div>

        <Stack gap="lg">
          <CustomerSelectModal
            value={form.values.customer}
            onChange={(value) =>
              form.setFieldValue("customer", value)
            }
            error={
              (form.errors.customer as string | undefined) ||
              undefined
            }
            required
          />

          <Group grow align="flex-start">
            <Select
              label="Case Type"
              placeholder="Select an Option"
              data={caseTypeOptions}
              value={form.values.caseType}
              onChange={(value) =>
                form.setFieldValue("caseType", value || "")
              }
              error={form.errors.caseType}
              required
              disabled={isCaseTypesLoading || caseTypeOptions.length === 0}
              radius="md"
            />
            <Select
              label="Priority Level"
              placeholder="Select an Option"
              data={PRIORITY_OPTIONS}
              value={form.values.priorityLevel}
              onChange={(value) =>
                form.setFieldValue("priorityLevel", value || "")
              }
              error={form.errors.priorityLevel}
              required
              radius="md"
            />
          </Group>

          <Textarea
            label="Description"
            placeholder="Write here"
            value={form.values.description}
            onChange={(e) =>
              form.setFieldValue(
                "description",
                e.currentTarget.value
              )
            }
            error={form.errors.description}
            required
            radius="md"
            minRows={4}
          />

          <div>
            <FileUpload
              label="Attachment"
              value={form.values.attachment}
              onChange={(file) =>
                form.setFieldValue("attachment", file)
              }
              required
              error={
                typeof form.errors.attachment === "string"
                  ? form.errors.attachment
                  : undefined
              }
            />
            <button
              type="button"
              onClick={handleAddAttachment}
              className="mt-2 text-sm font-medium text-red-500 hover:text-red-600 hover:underline focus:outline-none"
            >
              + Add Attachment
            </button>
          </div>
        </Stack>

        <Group justify="center" wrap="nowrap" gap="sm" mt="xl">
          <CustomButton
            fullWidth
            size="md"
            buttonType="secondary"
            onClick={handleCancel}
            disabled={createTicketMutation.isPending}
          >
            Cancel
          </CustomButton>
          <CustomButton
            fullWidth
            size="md"
            buttonType="primary"
            onClick={handleCreateIncidentClick}
            loading={createTicketMutation.isPending}
            disabled={createTicketMutation.isPending}
          >
            Create Incident
          </CustomButton>
        </Group>

        {isCaseTypesError && (
          <Text size="sm" c="red" mt="md">
            Unable to load case types. Please refresh and try again.
          </Text>
        )}

        {!isCaseTypesLoading && !isCaseTypesError && caseTypeOptions.length === 0 && (
          <Text size="sm" c="dimmed" mt="md">
            No case types are available yet.
          </Text>
        )}
      </div>

      <ConfirmationModal
        opened={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Create Incident?"
        message="Are you sure you want to create this incident? An incident ID will be attached to it."
        primaryButtonText="Yes, Create"
        secondaryButtonText="No, Close"
        onPrimary={handleConfirmCreate}
        onSecondary={() => setIsConfirmOpen(false)}
        loading={createTicketMutation.isPending}
      />

      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Incident Created"
        message="Incident successfully created. An incident ID will be sent to the customer involved."
        primaryButtonText="Manage Incident"
        onPrimaryClick={handleManageIncident}
        secondaryButtonText="No, Close"
        onSecondaryClick={() => setIsSuccessOpen(false)}
      />
    </div>
  );
}
