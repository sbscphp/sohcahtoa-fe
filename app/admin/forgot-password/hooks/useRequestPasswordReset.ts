import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { ApiResponse, ApiError } from "@/app/_lib/api/client";
import type { EmailFormValues } from "../_schemas/forgotPassword.schema";

export function useRequestPasswordReset(
  options?: Omit<
    UseMutationOptions<ApiResponse<null>, Error, EmailFormValues>,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: (payload: EmailFormValues) =>
      adminApi.auth.forgotPassword(payload),
    ...options,
    onError: (error, variables, context, mutation) => {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse;
      notifications.show({
        title: "Request Failed",
        message: apiResponse?.error?.message ?? error.message ?? "Failed to send password reset email. Please try again.",
        color: "red",
      });
      options?.onError?.(error, variables, context, mutation);
    },
  });
}
