import { useMutation, type UseMutationOptions } from "@tanstack/react-query";

type VerifyOtpResponse = { success: boolean };

export function useVerifyOtp(
  options?: Omit<
    UseMutationOptions<VerifyOtpResponse, Error, string>,
    "mutationFn"
  >
) {
  return useMutation({
    mutationFn: async (otp: string) => {
      // TODO: Replace with actual API call
      // const response = await fetch("/api/admin/forgot-password/verify-otp", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ otp }),
      // });
      // return response.json();
      
      await new Promise((r) => setTimeout(r, 1000)); // mock delay
      
      // Mock: simulate failure for OTP "000000" to test error modal
      if (otp === "000000") {
        throw new Error("Invalid OTP");
      }
      
      return { success: true } satisfies VerifyOtpResponse;
    },
    ...options,
  });
}
