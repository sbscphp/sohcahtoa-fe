import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { CreatePasswordFormValues } from "../_schemas/forgotPassword.schema";

type CreateNewPasswordResponse = { success: boolean };

export function useCreateNewPassword(
  options?: Omit<
    UseMutationOptions<CreateNewPasswordResponse, Error, CreatePasswordFormValues>,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: async (payload: CreatePasswordFormValues) => {
      // TODO: Replace with actual API call
      // const response = await fetch("/api/admin/forgot-password/reset", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ password: payload.password }),
      // });
      // return response.json();
      
      await new Promise((r) => setTimeout(r, 1200)); // mock delay
      return { success: true } satisfies CreateNewPasswordResponse;
    },
    ...options,
  });
}
