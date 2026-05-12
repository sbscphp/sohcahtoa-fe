/**
 * Generic TanStack Query hooks
 * Works with any typed API function
 * Usage: useCreateData(customerApi.tourist.createAccount)
 */

"use client";

import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";

export type ApiResponseData = Record<string, unknown> | unknown[];

// ==================== Generic Mutation Hooks ====================

/**
 * Generic create mutation hook
 * Usage: const create = useCreateData(customerApi.tourist.createAccount);
 */
export function useCreateData<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">
) {
  return useMutation({
    mutationFn,
    ...options,
  });
}

/**
 * Generic update (PUT) mutation hook
 * Usage: const update = usePutData(adminApi.transactions.update);
 */
export function usePutData<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">
) {
  return useMutation({
    mutationFn,
    ...options,
  });
}

/**
 * Generic update (PATCH) mutation hook
 */
export function usePatchData<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">
) {
  return useMutation({
    mutationFn,
    ...options,
  });
}

/**
 * Generic delete mutation hook
 * Usage: const deleteItem = useDeleteData((id: string) => adminApi.transactions.delete(id));
 */
export function useDeleteData<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">
) {
  return useMutation({
    mutationFn,
    ...options,
  });
}

/**
 * Generic upload mutation hook (multipart/form-data)
 * Usage: const upload = useUploadData((formData: FormData) => transactionsApi.uploadDocuments(id, formData));
 */
export function useUploadData<TData = unknown, TVariables = FormData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">
) {
  return useMutation({
    mutationFn,
    ...options,
  });
}

/**
 * Generic export data mutation hook (blob response)
 * Usage: const exportData = useCreateExportData((params) => reportsApi.export(params));
 */
export function useCreateExportData<TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<Blob>,
  options?: Omit<UseMutationOptions<Blob, Error, TVariables>, "mutationFn">
) {
  return useMutation({
    mutationFn,
    ...options,
  });
}

/**
 * Generic get export data mutation hook (blob response)
 */
export function useGetExportData(
  mutationFn: () => Promise<Blob>,
  options?: Omit<UseMutationOptions<Blob, Error, void>, "mutationFn">
) {
  return useMutation({
    mutationFn,
    ...options,
  });
}

/**
 * Generic get export zip data mutation hook
 */
export function useGetExportZipData(
  mutationFn: () => Promise<Blob>,
  options?: Omit<UseMutationOptions<Blob, Error, void>, "mutationFn">
) {
  return useMutation({
    mutationFn,
    ...options,
  });
}

/**
 * Generic create data for bulk form data mutation hook
 */
export function useCreateDataForBulkFormData<TVariables = FormData>(
  mutationFn: (variables: TVariables) => Promise<Blob>,
  options?: Omit<UseMutationOptions<Blob, Error, TVariables>, "mutationFn">
) {
  return useMutation({
    mutationFn,
    ...options,
  });
}

/**
 * Generic update (PUT) for form data mutation hook
 */
export function usePutDataForFormData<TData = unknown, TVariables = FormData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">
) {
  return useMutation({
    mutationFn,
    ...options,
  });
}

// ==================== Generic Query Hooks ====================

/**
 * Generic fetch data query hook
 * Usage: const { data } = useFetchData(customerKeys.profile(), customerApi.profile);
 */
export function useFetchData<TData = ApiResponseData>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  enabled = true,
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn" | "enabled">
) {
  return useQuery({
    queryKey,
    queryFn,
    enabled: !!enabled,
    retry: false,
    ...options,
  });
}

/**
 * Generic fetch single data query hook
 * Usage: const { data } = useFetchSingleData(customerKeys.transaction(id), () => transactionsApi.getById(id), !!id);
 */
export function useFetchSingleData<TData = ApiResponseData>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  enabled = false,
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn" | "enabled">
) {
  return useQuery({
    queryKey,
    queryFn,
    enabled: !!enabled,
    retry: false,
    ...options,
  });
}

/**
 * Generic fetch data with separate loading states
 * Exposes both isLoading (first load) and isFetching (background refetch)
 */
export function useFetchDataSeperateLoading<TData = ApiResponseData>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  enabled = true,
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn" | "enabled">
) {
  const query = useQuery({
    queryKey,
    queryFn,
    enabled: !!enabled,
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });

  return {
    ...query,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}

/**
 * Generic fetch post data query hook (POST request used as query)
 * Usage: const { data } = useFetchPostData(customerKeys.exchangeRate(params), () => paymentsApi.getExchangeRate(params));
 */
export function useFetchPostData<TData = ApiResponseData, TVariables = unknown>(
  queryKey: unknown[],
  queryFn: (variables: TVariables) => Promise<TData>,
  variables: TVariables,
  enabled = true,
  options?: Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn" | "enabled">
) {
  return useQuery({
    queryKey,
    queryFn: () => queryFn(variables),
    enabled: !!enabled,
    retry: false,
    ...options,
  });
}

/**
 * Generic get data mutation hook (single fetch, not cached)
 * Usage: const getData = useGetData(() => customerApi.profile());
 */
export function useGetData<TData = ApiResponseData>(
  queryFn: () => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, void>, "mutationFn">
) {
  return useMutation({
    mutationFn: queryFn,
    ...options,
  });
}
