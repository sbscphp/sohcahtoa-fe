"use client";

import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { Button, Select, Textarea } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import FileUploadInput from "@/app/(customer)/_components/forms/FileUploadInput";
import { ConfirmationModal } from "@/app/(customer)/_components/modals/ConfirmationModal";
import { TransactionSuccessModal } from "@/app/(customer)/_components/modals/TransactionSuccessModal";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown } from "@hugeicons/core-free-icons";
import { useUploadData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { handleApiError } from "@/app/_lib/api/error-handler";
import type { SupportTicketCategory } from "@/app/_lib/api/types";
import { SuccessModal } from '../modals/SuccessModal';

const CATEGORY_OPTIONS: { value: SupportTicketCategory; label: string }[] = [
  { value: "TRANSACTION_ISSUE", label: "Transaction issue" },
  { value: "ACCOUNT_ACCESS", label: "Account access" },
  { value: "PAYMENT_ISSUE", label: "Payment issue" },
  { value: "DOCUMENT_VERIFICATION", label: "Document verification" },
  { value: "TECHNICAL_ISSUE", label: "Technical issue" },
  { value: "COMPLIANCE_INQUIRY", label: "Compliance / regulatory inquiry" },
  { value: "GENERAL_INQUIRY", label: "General inquiry" },
  { value: "OTHER", label: "Other" },
];

type CategoryValue = (typeof CATEGORY_OPTIONS)[number]["value"];

const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;
const ATTACHMENT_ACCEPT_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ATTACHMENT_ACCEPT_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".doc", ".docx"];

const initialValues = {
  category: "" as CategoryValue | "",
  description: "",
  attachment: null as FileWithPath | null,
};

export default function ChatSupportForm() {
  const router = useRouter();
  const [confirmOpened, { open: openConfirm, close: closeConfirm }] =
    useDisclosure(false);
  const [successOpened, { open: openSuccess, close: closeSuccess }] =
    useDisclosure(false);

  const createTicket = useUploadData(customerApi.support.tickets.create);

  const form = useForm({
    mode: "uncontrolled",
    initialValues,
    validate: {
      category: (v: string) => (v?.trim() ? null : "Category is required"),
      description: (v: string) => (v?.trim() ? null : "Description is required"),
    },
  });

  const handleSubmit = form.onSubmit(() => {
    openConfirm();
  });

  const handleConfirmSubmit = () => {
    const values = form.values;
    const formData = new FormData();
    formData.append("category", values.category);
    formData.append("description", values.description);
    if (values.attachment) {
      formData.append("attachment", values.attachment, values.attachment.name);
    }

    createTicket.mutate(formData, {
      onSuccess: () => {
        closeConfirm();
        openSuccess();
        form.reset();
      },
      onError: (error) => {
        closeConfirm();
        handleApiError(error);
      },
    });
  };

  const handleAttachmentChange = (file: FileWithPath | null) => {
    form.clearFieldError("attachment");
    form.setFieldValue("attachment", file);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 w-full max-w-[640px] mx-auto">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-body-heading-300 text-xl md:text-2xl font-bold">
            Support
          </h2>
          <p className="text-body-text-200 text-sm md:text-base">
            Need help? Fill out this form to contact support for assistance.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
        <Select
            label="Category"
            placeholder="Select Category"
            data={CATEGORY_OPTIONS}
            size="md"
            radius="md"
            rightSection={<HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />}
            {...form.getInputProps("category")}
          />
          <Textarea
            label="Description"
            required
            placeholder="Please describe the issue in detail"
            minRows={4}
            size="md"
            radius="md"
            classNames={{
              label: "text-sm font-medium text-[#6C6969]",
              input: "border-gray-200 rounded-lg",
            }}
            {...form.getInputProps("description")}
          />
          <FileUploadInput
            label="Attachment (optional)"
            required={false}
            value={form.values.attachment}
            onChange={handleAttachmentChange}
            accept={ATTACHMENT_ACCEPT_MIME}
            maxSizeBytes={MAX_ATTACHMENT_SIZE_BYTES}
            error={form.errors.attachment as string | undefined}
            placeholder="Click to upload"
          />
          <p className="text-body-text-200 text-sm">
            Note: Once submitted, you can track it in support history.
          </p>
          <div className="flex flex-row justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              radius="xl"
              className="min-h-[44px] px-6 border-text-50 text-[#4D4B4B] hover:bg-gray-50"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              radius="xl"
              loading={createTicket.isPending}
              disabled={createTicket.isPending}
              className="min-h-[44px] px-6 bg-primary-400 hover:bg-primary-500 text-white font-medium"
            >
              Submit Form
            </Button>
          </div>
        </form>
      </div>

      <ConfirmationModal
        opened={confirmOpened}
        onClose={closeConfirm}
        title="Submit Form?"
        description="Are you sure you want to submit this form?"
        confirmLabel="Yes, Save Changes"
        cancelLabel="No, Close"
        onConfirm={handleConfirmSubmit}
        variant="info"
        loading={createTicket.isPending}
      />
      <SuccessModal
        opened={successOpened}
        onClose={closeSuccess}
        title="Form Submitted"
        message="Your support request has been submitted successfully."
        buttonText="Continue"
        onButtonClick={() => {
          closeSuccess();
          router.push("/support");
        }}
      />
    </>
  );
}
