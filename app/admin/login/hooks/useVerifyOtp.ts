/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";

export function useVerifyOtp(options?: any) {
  return useMutation({
    mutationFn: async (otp: string) => {
      await new Promise((r) => setTimeout(r, 1000));
      return true;
    },
    ...options,
  });
}
