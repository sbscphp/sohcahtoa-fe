"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stack, Text, Select, Group, Textarea } from "@mantine/core";
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

export default function CreateTicketPage() {
  const router = useRouter();

  const [customer, setCustomer] = useState<CustomerOption | null>(null);
  const [caseType, setCaseType] = useState<string | null>(null);
  const [priorityLevel, setPriorityLevel] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  const [customerError, setCustomerError] = useState("");
  const [caseTypeError, setCaseTypeError] = useState("");
  const [priorityError, setPriorityError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [attachmentError, setAttachmentError] = useState("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const clearErrors = () => {
    setCustomerError("");
    setCaseTypeError("");
    setPriorityError("");
    setDescriptionError("");
    setAttachmentError("");
  };

  const validate = (): boolean => {
    clearErrors();
    let valid = true;
    if (!customer) {
      setCustomerError("Customer is required");
      valid = false;
    }
    if (!caseType) {
      setCaseTypeError("Case type is required");
      valid = false;
    }
    if (!priorityLevel) {
      setPriorityError("Priority level is required");
      valid = false;
    }
    if (!description.trim()) {
      setDescriptionError("Description is required");
      valid = false;
    }
    if (!attachment) {
      setAttachmentError("Attachment is required");
      valid = false;
    }
    return valid;
  };

  const handleCancel = () => {
    router.push(adminRoutes.adminTickets());
  };

  const handleCreateIncidentClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmCreate = async () => {
    if (!validate()) {
      setIsConfirmOpen(false);
      return;
    }
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
            value={customer}
            onChange={setCustomer}
            error={customerError || undefined}
            required
          />

          <Group grow align="flex-start">
            <Select
              label="Case Type"
              placeholder="Select an Option"
              data={CASE_TYPE_OPTIONS}
              value={caseType}
              onChange={setCaseType}
              error={caseTypeError || undefined}
              required
              radius="md"
            />
            <Select
              label="Priority Level"
              placeholder="Select an Option"
              data={PRIORITY_OPTIONS}
              value={priorityLevel}
              onChange={setPriorityLevel}
              error={priorityError || undefined}
              required
              radius="md"
            />
          </Group>

          <Textarea
            label="Description"
            placeholder="Write here"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            error={descriptionError || undefined}
            required
            radius="md"
            minRows={4}
          />

          <div>
            <FileUpload
              label="Attachment"
              value={attachment}
              onChange={setAttachment}
              required
              error={attachmentError || undefined}
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
