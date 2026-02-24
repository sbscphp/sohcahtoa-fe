"use client";

import { useRouter } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { Card, Text, TextInput, Select, Textarea, Button, Group, Stack } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import FileUploadInput from "@/app/(customer)/_components/forms/FileUploadInput";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { ChevronDown } from "lucide-react";

const supportSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  attachment: z.any().optional(),
});

type SupportFormValues = z.infer<typeof supportSchema>;

const CATEGORIES = [
  "Account",
  "Transaction",
  "Verification",
  "Technical",
  "Other",
];

export default function ChatSupportPage() {
  const router = useRouter();
  const [confirmOpened, { open: openConfirm, close: closeConfirm }] =
    useDisclosure(false);
  const [successOpened, { open: openSuccess, close: closeSuccess }] =
    useDisclosure(false);

  const form = useForm<SupportFormValues>({
    initialValues: {
      customerId: "2223334355",
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
    closeConfirm();
    // Mock API call
    setTimeout(() => {
      openSuccess();
      form.reset();
    }, 500);
  };

  return (
    <>
      <div className="space-y-6">
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
                <TextInput
                  label="Customer ID"
                  required
                  placeholder="Customer ID"
                  size="md"
                  radius="md"
                  {...form.getInputProps("customerId")}
                />
                <Select
                  label="Category"
                  placeholder="Select Category"
                  data={CATEGORIES}
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
                  disabled={!form.isValid()}
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
