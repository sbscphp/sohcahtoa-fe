import { useCreateData } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";

export function useLogin(options?: Parameters<typeof useCreateData>[1]) {
  return useCreateData(adminApi.auth.login, options);
}

export function useVerifyOtp(options?: Parameters<typeof useCreateData>[1]) {
  return useCreateData(adminApi.auth.verifyLogin, options);
}
