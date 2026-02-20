"use client";

import { useSetAtom } from "jotai";
import { useCreateData } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { adminUserAtom } from "@/app/admin/_lib/atoms/admin-auth-atom";
import type { ApiResponse } from "@/app/_lib/api/client";
import type { AdminUser } from "@/app/admin/_lib/atoms/admin-auth-atom";

export function useLogin(options?: Parameters<typeof useCreateData>[1]) {
  return useCreateData(adminApi.auth.login, options);
}

export function useVerifyOtp(
  options?: Omit<
    Parameters<typeof useCreateData<ApiResponse<AdminUser>, { otp: string; email: string }>>[1],
    "onSuccess"
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
  });
}
