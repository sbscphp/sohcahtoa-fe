import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { adminApi } from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";
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
  });
}
