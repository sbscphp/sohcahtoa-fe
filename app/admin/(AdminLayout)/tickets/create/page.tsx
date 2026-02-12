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

const CASE_TYPE_OPTIONS = [
  { value: "Technical", label: "Technical" },
  { value: "Billing", label: "Billing" },
  { value: "General", label: "General" },
];

const PRIORITY_OPTIONS = [
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
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
  const [isSaving, setIsSaving] = useState(false);

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
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    setIsConfirmOpen(false);
    setIsSuccessOpen(true);
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
              data={CASE_TYPE_OPTIONS}
              value={form.values.caseType}
              onChange={(value) =>
                form.setFieldValue("caseType", value || "")
              }
              error={form.errors.caseType}
              required
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
          >
            Cancel
          </CustomButton>
          <CustomButton
            fullWidth
            size="md"
            buttonType="primary"
            onClick={handleCreateIncidentClick}
          >
            Create Incident
          </CustomButton>
        </Group>
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
        loading={isSaving}
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
