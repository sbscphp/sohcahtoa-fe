import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";

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
  });
}
