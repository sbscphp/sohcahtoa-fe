"use client";

import { useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useCreateData } from "@/app/_lib/api/hooks";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { adminApi } from "@/app/admin/_services/admin-api";

interface UseWorkflowTemplateStatusActionsOptions {
  onDeactivateSuccess?: () => void;
  onActivateSuccess?: () => void;
}

function handleMutationError(error: Error, defaultMessage: string) {
  const apiResponse = (error as unknown as ApiError).data as ApiResponse | undefined;
  notifications.show({
    color: "red",
    title: "Status Update Failed",
    message: apiResponse?.error?.message ?? error.message ?? defaultMessage,
  });
}

async function invalidateWorkflowQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  templateId: string
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: ["admin", "workflow", "template", templateId],
    }),
    queryClient.invalidateQueries({
      queryKey: ["admin", "workflow", "management"],
    }),
  ]);
}

export function useWorkflowTemplateStatusActions(
  templateId: string,
  options?: UseWorkflowTemplateStatusActionsOptions
) {
  const queryClient = useQueryClient();

  const deactivateMutation = useCreateData(
    () => adminApi.workflow.deactivateTemplate(templateId),
    {
      onSuccess: async () => {
        await invalidateWorkflowQueries(queryClient, templateId);
        options?.onDeactivateSuccess?.();
      },
      onError: (error) =>
        handleMutationError(error, "Unable to deactivate this workflow. Please try again."),
    }
  );

  const activateMutation = useCreateData(
    () => adminApi.workflow.activateTemplate(templateId),
    {
      onSuccess: async () => {
        await invalidateWorkflowQueries(queryClient, templateId);
        options?.onActivateSuccess?.();
      },
      onError: (error) =>
        handleMutationError(error, "Unable to activate this workflow. Please try again."),
    }
  );

  return {
    deactivate: deactivateMutation,
    activate: activateMutation,
    isDeactivating: deactivateMutation.isPending,
    isActivating: activateMutation.isPending,
  };
}
