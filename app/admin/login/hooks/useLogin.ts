import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { LoginFormValues } from "../_schemas/login.schema";

type LoginResponse = { requiresOtp: boolean };

export function useLogin(
  options?: Omit<
    UseMutationOptions<LoginResponse, Error, LoginFormValues>,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: async (payload: LoginFormValues) => {
      await new Promise((r) => setTimeout(r, 1200)); // mock delay
      return { requiresOtp: true } satisfies LoginResponse;
    },
    ...options,
  });
}
