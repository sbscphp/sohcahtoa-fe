import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { ApiResponse, ApiError } from "@/app/_lib/api/client";

interface ValidateOtpResponseData {
  resetToken: string;
}

export function useVerifyOtp(
  options?: Omit<
    UseMutationOptions<ApiResponse<ValidateOtpResponseData>, Error, string>,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: (otp: string) => adminApi.auth.validateOtp({ otp }),
    ...options,
    onError: (error, variables, context, mutation) => {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse;
      notifications.show({
        title: "Invalid OTP",
        message: apiResponse?.error?.message ?? error.message ?? "OTP verification failed. Please check the code and try again.",
        color: "red",
      });
      options?.onError?.(error, variables, context, mutation);
    },
  });
}
