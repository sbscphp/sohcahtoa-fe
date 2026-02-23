import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { ApiResponse, ApiError } from "@/app/_lib/api/client";

export interface ResetPasswordPayload {
  resetToken: string;
  password: string;
}

export function useCreateNewPassword(
  options?: Omit<
    UseMutationOptions<ApiResponse<null>, Error, ResetPasswordPayload>,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      adminApi.auth.resetPassword(payload),
    ...options,
    onError: (error, variables, context, mutation) => {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse;
      notifications.show({
        title: "Password Reset Failed",
        message: apiResponse?.error?.message ?? error.message ?? "Failed to reset password. Please try again.",
        color: "red",
      });
      options?.onError?.(error, variables, context, mutation);
    },
  });
}
