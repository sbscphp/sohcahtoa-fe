"use client";

import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { Button, TextInput, Select, Textarea } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import FileUploadInput from "@/app/(customer)/_components/forms/FileUploadInput";
import { ConfirmationModal } from "@/app/(customer)/_components/modals/ConfirmationModal";
import { TransactionSuccessModal } from "@/app/(customer)/_components/modals/TransactionSuccessModal";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown } from "@hugeicons/core-free-icons";

const CATEGORIES = [
  "Account",
  "Transaction",
  "Verification",
  "Technical",
  "Other",
];

const initialValues = {
  customerId: "2223334355",
  category: "" as string,
  description: "",
  attachment: null as FileWithPath | null,
};

export default function ChatSupportForm() {
  const router = useRouter();
  const [confirmOpened, { open: openConfirm, close: closeConfirm }] =
    useDisclosure(false);
  const [successOpened, { open: openSuccess, close: closeSuccess }] =
    useDisclosure(false);

  const form = useForm({
    mode: "uncontrolled",
    initialValues,
    validate: {
      customerId: (v) => (v?.trim() ? null : "Customer ID is required"),
      description: (v) => (v?.trim() ? null : "Description is required"),
    },
  });

  const handleSubmit = form.onSubmit(() => {
    openConfirm();
  });

  const handleConfirmSubmit = () => {
    closeConfirm();
    openSuccess();
    form.reset();
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
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <TextInput
            label="Customer ID"
            required
            placeholder="Customer ID"
            size="md"
            radius="md"
            classNames={{
              label: "text-sm font-medium text-[#6C6969]",
              input: "border-gray-200 rounded-lg",
            }}
            {...form.getInputProps("customerId")}
          />
          <Select
            label="Category"
            placeholder="Select Category"
            data={CATEGORIES}
            size="md"
            radius="md"
            rightSection={<HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />}
            classNames={{
              label: "text-sm font-medium text-[#6C6969]",
              input: "border-gray-200 rounded-lg",
            }}
            {...form.getInputProps("category")}
          />
       </div>
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
            onChange={(file) => form.setFieldValue("attachment", file)}
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
      />
      <TransactionSuccessModal
        opened={successOpened}
        onClose={closeSuccess}
        title="Form Submitted"
        description="Your support request has been submitted successfully."
        confirmLabel="Continue"
        onConfirm={() => {
          closeSuccess();
          router.push("/support");
        }}
      />
    </>
  );
}
