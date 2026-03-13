"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Group, Select, Stack, Text, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import FileUpload from "@/app/admin/_components/FileUpload";
import CustomerSelectModal, {
  type CustomerOption,
} from "../../_ticketsComponents/CustomerSelectModal";
import { adminRoutes } from "@/lib/adminRoutes";
import { useTicketCaseTypes } from "../../hooks/useTicketCaseTypes";
import { useAllCustomers } from "../../hooks/useAllCustomers";
import { useCreateData, useFetchData } from "@/app/_lib/api/hooks";
import { adminApi, type TicketDetailsResponseData } from "@/app/admin/_services/admin-api";
import { type ApiError, type ApiResponse } from "@/app/_lib/api/client";
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

export default function EditTicketPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const id = params?.id as string;

  const {
    options: caseTypeOptions,
    isLoading: isCaseTypesLoading,
    isError: isCaseTypesError,
  } = useTicketCaseTypes();
  const { customers, isLoading: isCustomersLoading } = useAllCustomers();

  const ticketQuery = useFetchData<ApiResponse<TicketDetailsResponseData>>(
    [...adminKeys.tickets.detail(id ?? "")],
    () =>
      adminApi.tickets.getById(id ?? "") as unknown as Promise<
        ApiResponse<TicketDetailsResponseData>
      >,
    Boolean(id)
  );

  const ticketData = ticketQuery.data?.data ?? null;
  const existingAttachment = ticketData?.attachments?.[0] ?? null;
  const [isPrefilled, setIsPrefilled] = useState(false);

  const form = useForm<TicketFormValues>({
    initialValues: {
      customer: null,
      caseType: "",
      priorityLevel: "",
      description: "",
      attachment: null,
    },
    validate: {
      customer: (value) => (value ? null : "Customer is required"),
      caseType: (value) => (value ? null : "Case type is required"),
      priorityLevel: (value) => (value ? null : "Priority level is required"),
      description: (value) =>
        value.trim().length > 0 ? null : "Description is required",
    },
  });

  useEffect(() => {
    if (!ticketData || isPrefilled) {
      return;
    }

    const rawCustomerName =
      ticketData.customer?.fullName ?? ticketData.customerName ?? "";
    const rawCustomerEmail =
      ticketData.customer?.email ?? ticketData.customerEmail ?? "";
    const customerName = rawCustomerName || "--";
    const customerEmail = rawCustomerEmail || "--";

    const matchedCustomer = customers.find(
      (customer) => customer.id === ticketData.customerId
    );

    // Wait for customer options when ticket payload doesn't provide identity fields.
    if (
      !matchedCustomer &&
      isCustomersLoading &&
      !rawCustomerName &&
      !rawCustomerEmail
    ) {
      return;
    }

    form.setValues({
      customer: matchedCustomer
        ? {
            id: matchedCustomer.id,
            name: matchedCustomer.name,
            email: matchedCustomer.email,
          }
        : {
            id: ticketData.customerId,
            name: customerName,
            email: customerEmail,
          },
      caseType: ticketData.caseType ?? "",
      priorityLevel: ticketData.priority ?? "",
      description: ticketData.description ?? "",
      attachment: null,
    });
    setIsPrefilled(true);
  }, [customers, form, isCustomersLoading, isPrefilled, ticketData]);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const updateTicketMutation = useCreateData(
    (payload: FormData) => adminApi.tickets.update(id, payload),
    {
      onSuccess: async () => {
        setIsConfirmOpen(false);
        setIsSuccessOpen(true);

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.tickets.detail(id)],
          }),
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
          title: "Save Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to save ticket changes. Please try again.",
          color: "red",
        });
      },
    }
  );

  const handleCancel = () => {
    router.push(adminRoutes.adminTicketDetails(id));
  };

  const handleOpenConfirm = () => {
    const result = form.validate();
    if (!result.hasErrors) {
      setIsConfirmOpen(true);
    }
  };

  const handleConfirmSave = async () => {
    if (!form.values.customer) {
      return;
    }

    const payload = new FormData();
    payload.append("customer", form.values.customer.id);
    payload.append("caseType", form.values.caseType);
    payload.append("priorityLevel", form.values.priorityLevel);
    payload.append("description", form.values.description.trim());

    if (form.values.attachment) {
      payload.append("file", form.values.attachment);
    }

    updateTicketMutation.mutate(payload);
  };

  const handleManageIncident = () => {
    setIsSuccessOpen(false);
    router.push(adminRoutes.adminTicketDetails(id));
  };

  const handleAddAttachment = () => {
    document.getElementById(FILE_INPUT_ID)?.click();
  };

  const existingAttachmentName = existingAttachment?.fileName?.trim()
    ? existingAttachment.fileName
    : existingAttachment?.fileUrl
      ? existingAttachment.fileUrl.split("/").pop() ?? "Attachment"
      : "";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8">
          <Text className="text-xl! font-bold! text-gray-900!" mb={4}>
            Ticket Details
          </Text>
          <Text className="text-base! font-normal! text-gray-600!">
            Update the incident details below
          </Text>
        </div>

        <Stack gap="lg">
          <CustomerSelectModal
            value={form.values.customer}
            onChange={(value) => form.setFieldValue("customer", value)}
            error={(form.errors.customer as string | undefined) || undefined}
            required
          />

          <Group grow align="flex-start">
            <Select
              label="Case Type"
              placeholder="Select an Option"
              data={caseTypeOptions}
              value={form.values.caseType}
              onChange={(value) => form.setFieldValue("caseType", value || "")}
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
              form.setFieldValue("description", e.currentTarget.value)
            }
            error={form.errors.description}
            required
            radius="md"
            minRows={4}
          />

          <div>
            {existingAttachment?.fileUrl && (
              <div className="mb-3">
                <Text size="sm" c="dimmed">
                  Current Attachment:
                </Text>
                <a
                  href={existingAttachment.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-gray-900 underline hover:text-orange-600"
                >
                  {existingAttachmentName}
                </a>
              </div>
            )}

            <FileUpload
              label="Attachment"
              value={form.values.attachment}
              onChange={(file) => form.setFieldValue("attachment", file)}
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
            disabled={updateTicketMutation.isPending}
          >
            Cancel
          </CustomButton>
          <CustomButton
            fullWidth
            size="md"
            buttonType="primary"
            onClick={handleOpenConfirm}
            loading={updateTicketMutation.isPending}
            disabled={updateTicketMutation.isPending || ticketQuery.isLoading}
          >
            Save Changes
          </CustomButton>
        </Group>

        {ticketQuery.isError && (
          <Text size="sm" c="red" mt="md">
            Unable to load ticket details. Please refresh and try again.
          </Text>
        )}

        {isCaseTypesError && (
          <Text size="sm" c="red" mt="md">
            Unable to load case types. Please refresh and try again.
          </Text>
        )}
      </div>

      <ConfirmationModal
        opened={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Save Changes ?"
        message="Are you sure, save and update this changes? Kindly note that this new changes would override the existing data."
        primaryButtonText="Yes, Save and Update Changes"
        secondaryButtonText="No, Close"
        onPrimary={handleConfirmSave}
        onSecondary={() => setIsConfirmOpen(false)}
        loading={updateTicketMutation.isPending}
      />

      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Changes Saved"
        message="Ticket details have been updated successfully."
        primaryButtonText="View Incident"
        onPrimaryClick={handleManageIncident}
        secondaryButtonText="No, Close"
        onSecondaryClick={() => setIsSuccessOpen(false)}
      />
    </div>
  );
}
