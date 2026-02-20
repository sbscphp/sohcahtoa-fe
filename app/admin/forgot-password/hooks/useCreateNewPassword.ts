import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";

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
  });
}
