"use client";

import { useParams, useRouter } from "next/navigation";
import { Text, Group } from "@mantine/core";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { adminRoutes } from "@/lib/adminRoutes";

export default function EditWorkflowPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-2xl bg-white shadow-sm p-6 md:p-8">
        <div className="text-center mb-8">
          <Text fw={700} size="xl" className="text-gray-900">
            Edit Workflow
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Edit the workflow configuration for this process (ID: {id})
          </Text>
        </div>

        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <Text size="lg" c="dimmed" fw={500}>
            Edit form content will be implemented here
          </Text>
          <Text size="sm" c="dimmed" mt={8}>
            This page will contain the workflow editing form with pre-populated data from the existing workflow.
          </Text>
        </div>

        <Group justify="center" wrap="nowrap" gap="sm" mt="xl">
          <CustomButton
            fullWidth
            size="md"
            buttonType="secondary"
            onClick={() => router.push(adminRoutes.adminWorkflowDetails(id))}
          >
            Back
          </CustomButton>
          <CustomButton
            fullWidth
            size="md"
            buttonType="primary"
            onClick={() => router.push(adminRoutes.adminWorkflowDetails(id))}
          >
            Save Changes
          </CustomButton>
        </Group>
      </div>
    </div>
  );
}
