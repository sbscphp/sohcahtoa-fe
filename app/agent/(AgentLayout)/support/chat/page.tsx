"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { Card, Text, Select, Textarea, Button, Group, Stack, Loader } from "@mantine/core";
import FileUploadInput from "@/app/(customer)/_components/forms/FileUploadInput";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { useUploadData } from "@/app/_lib/api/hooks";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { ChevronDown } from "lucide-react";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";
import { agentKeys } from "@/app/_lib/api/query-keys";
import type { SupportTicketCategory } from "@/app/_lib/api/types";
import { handleApiError } from "@/app/_lib/api/error-handler";

const supportSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  attachment: z.any().optional(),
});

type SupportFormValues = z.infer<typeof supportSchema>;

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

export default function ChatSupportPage() {
  const router = useRouter();
  const [customerSearch, setCustomerSearch] = useState("");
  const [debouncedCustomerSearch] = useDebouncedValue(customerSearch, 300);
  const [confirmOpened, { open: openConfirm, close: closeConfirm }] =
    useDisclosure(false);
  const [successOpened, { open: openSuccess, close: closeSuccess }] =
    useDisclosure(false);
  const createTicket = useUploadData(agentApi.support.tickets.create);

  const customerListParams = useMemo(
    () => ({
      page: 1,
      limit: 20,
      search: debouncedCustomerSearch?.trim() || undefined,
    }),
    [debouncedCustomerSearch]
  );

  const { data: customerListResponse, isLoading: isCustomersLoading } = useFetchData(
    [...agentKeys.customers.list(customerListParams)],
    () => agentApi.customers.list(customerListParams)
  );

  const customerOptions = useMemo(
    () =>
      (customerListResponse?.data ?? []).map((customer) => ({
        value: customer.userId,
        label: `${customer.fullName}`,
      })),
    [customerListResponse]
  );

  const form = useForm<SupportFormValues>({
    initialValues: {
      customerId: "",
      category: "",
      description: "",
      attachment: null,
    },
    validate: zod4Resolver(supportSchema),
    validateInputOnChange: true,
  });

  const handleSubmit = form.onSubmit(() => {
    openConfirm();
  });

  const handleConfirmSubmit = () => {
    const values = form.values;
    const formData = new FormData();
    formData.append("customerId", values.customerId);
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
        handleApiError(error, {
          customMessage: "Unable to submit support ticket. Please try again.",
        });
      },
    });
  };

  return (
    <>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Breadcrumbs */}
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Support
          </Text>
          <Text size="sm" c="dimmed">
            /
          </Text>
          <Text size="sm" fw={500}>
            Chat Support
          </Text>
        </Group>

        {/* Form Card */}
        <Card radius="md" padding="lg" withBorder>
          <Stack gap="lg">
            <div className="text-center space-y-2">
              <Text fw={600} size="xl">
                Support
              </Text>
              <Text size="sm" c="dimmed">
                Need help? Fill out this form to contact support for assistances
              </Text>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Customer"
                  required
                  placeholder="Search and select customer"
                  searchable
                  clearable
                  data={customerOptions}
                  searchValue={customerSearch}
                  onSearchChange={setCustomerSearch}
                  nothingFoundMessage={
                    isCustomersLoading
                      ? "Loading customers..."
                      : debouncedCustomerSearch
                      ? "No customer found"
                      : "No customers available"
                  }
                  size="md"
                  radius="md"
                  rightSection={isCustomersLoading ? <Loader size={14} /> : <ChevronDown size={16} />}
                  rightSectionPointerEvents="none"
                  {...form.getInputProps("customerId")}
                />
                <Select
                  label="Category"
                  placeholder="Select Category"
                  data={CATEGORY_OPTIONS}
                  size="md"
                  radius="md"
                  rightSection={<ChevronDown size={16} />}
                  rightSectionPointerEvents="none"
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
                {...form.getInputProps("description")}
              />

              <FileUploadInput
                label="Attachment (optional)"
                required={false}
                value={form.values.attachment}
                onChange={(file) => form.setFieldValue("attachment", file)}
                placeholder="Click to upload"
              />

              <Text size="xs" c="dimmed">
                Note: Once submitted, you can track it in support history.
              </Text>

              <Group justify="flex-end" gap="md" mt="lg">
                <Button
                  type="button"
                  variant="outline"
                  radius="xl"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  radius="xl"
                  color="orange"
                  disabled={!form.isValid() || createTicket.isPending}
                  loading={createTicket.isPending}
                >
                  Submit Form
                </Button>
              </Group>
            </form>
          </Stack>
        </Card>
      </div>

      <ConfirmationModal
        opened={confirmOpened}
        onClose={closeConfirm}
        title="Submit Form?"
        message="Are you sure you want to submit this form?"
        primaryButtonText="Yes, Save Changes"
        secondaryButtonText="No, Close"
        onPrimary={handleConfirmSubmit}
        onSecondary={closeConfirm}
        loading={createTicket.isPending}
      />

      <SuccessModal
        opened={successOpened}
        onClose={closeSuccess}
        title="Form Submitted"
        message="Your support request has been submitted successfully."
        primaryButtonText="Continue"
        primaryButtonVariant="outline"
        onPrimaryClick={() => {
          closeSuccess();
          router.push("/agent/support/history");
        }}
      />
    </>
  );
}
