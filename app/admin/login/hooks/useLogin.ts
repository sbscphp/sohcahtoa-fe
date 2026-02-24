"use client";

import { useSetAtom } from "jotai";
import { notifications } from "@mantine/notifications";
import { type UseMutationOptions } from "@tanstack/react-query";
import { useCreateData } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { adminUserAtom } from "@/app/admin/_lib/atoms/admin-auth-atom";
import type { ApiResponse, ApiError } from "@/app/_lib/api/client";
import type { AdminUser } from "@/app/admin/_lib/atoms/admin-auth-atom";

export function useLogin(options?: Parameters<typeof useCreateData>[1]) {
  return useCreateData(adminApi.auth.login, {
    ...options,
    onError: (error, variables, context, mutation) => {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse;
      notifications.show({
        title: "Login Failed",
        message: apiResponse?.error?.message ?? error.message ?? "An error occurred during login. Please try again.",
        color: "red",
      });
      options?.onError?.(error, variables, context, mutation);
    },
  });
}

export function useVerifyOtp(
  options?: Omit<
    UseMutationOptions<ApiResponse<AdminUser>, Error, { otp: string; email: string }>,
    "mutationFn" | "onSuccess"
  > & {
    onSuccess?: (data: ApiResponse<AdminUser>) => void;
  }
) {
  const setAdminUser = useSetAtom(adminUserAtom);

  return useCreateData(adminApi.auth.verifyLogin, {
    ...options,
    onSuccess: (data) => {
      if (data.success && data.data) {
        setAdminUser(data.data);
      }
      options?.onSuccess?.(data);
    },
    onError: (error, variables, context, mutation) => {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse;
      console.log(apiResponse);
      console.log(error);
      notifications.show({
        title: "Verification Failed",
        message: apiResponse?.error?.message ?? error.message ?? "An error occurred during OTP verification. Please try again.",
        color: "red",
      });
      options?.onError?.(error, variables, context, mutation);
    },
  });
}
