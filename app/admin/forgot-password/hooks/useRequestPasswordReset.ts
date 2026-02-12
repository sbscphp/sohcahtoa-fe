import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { EmailFormValues } from "../_schemas/forgotPassword.schema";

type RequestPasswordResetResponse = { success: boolean };

export function useRequestPasswordReset(
  options?: Omit<
    UseMutationOptions<RequestPasswordResetResponse, Error, EmailFormValues>,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: async (payload: EmailFormValues) => {
      // TODO: Replace with actual API call
      // const response = await fetch("/api/admin/forgot-password/request", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });
      // return response.json();
      
      await new Promise((r) => setTimeout(r, 1200)); // mock delay
      return { success: true } satisfies RequestPasswordResetResponse;
    },
    ...options,
  });
}
