/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { LoginFormValues } from "../_schemas/login.schema";

export function useLogin(options?: any) {
  return useMutation({
    mutationFn: async (payload: LoginFormValues) => {
      await new Promise((r) => setTimeout(r, 1200)); // mock delay
      return { requiresOtp: true };
    },
    ...options,
  });
}
