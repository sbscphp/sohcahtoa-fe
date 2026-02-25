/**
 * API usage examples
 *
 * Use these as reference for query keys, params, and hooks.
 * Params types are defined below so you know what each endpoint expects.
 */

"use client";

import {
  useFetchData,
  useFetchSingleData,
  useFetchDataSeperateLoading,
  useCreateData,
  usePutData,
  useUploadData,
} from "@/app/_lib/api/hooks";
import { customerKeys, adminKeys } from "@/app/_lib/api/query-keys";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { adminApi } from "@/app/admin/_services/admin-api";
import { handleApiError } from "@/app/_lib/api/error-handler";
import { Skeleton } from "@mantine/core";
import { UpdateTransactionRequest } from "./types";

// =============================================================================
// PARAMS – use these types when calling list/fetch APIs
// =============================================================================

/** Pagination: used by most list endpoints */
interface ListParams {
  page?: number;
  limit?: number;
}

/** Customer transactions list: pagination + optional status filter */
interface TransactionsListParams extends ListParams {
  status?: string; // e.g. "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED"
}

/** Admin customers list: pagination only */
type AdminCustomersListParams = ListParams;

// EXAMPLE 1: List with loading (useFetchDataSeperateLoading)
// Params: page, limit – same object for query key and API call

export function ExampleAdminCustomersList() {
  const page = 1;
  const limit = 10;

  const params: AdminCustomersListParams = { page, limit };

  const query = useFetchDataSeperateLoading(
    [...adminKeys.customers.list(params)],
    () => adminApi.customers.list(params),
    true,
  );

  const customerResponse = query?.data?.data as unknown[];
  const isLoading = query.isLoading;
  const isFetching = query.isFetching;

  return (
    <div>
      {isLoading ? (
        <Skeleton height={200} />
      ) : (
        <div>{customerResponse?.length ?? 0} items loaded</div>
      )}
      {isFetching && !isLoading && <span>Updating…</span>}
    </div>
  );
}

// EXAMPLE 2: List with filters (transactions – page, limit, status)
// Params: page, limit, status – pass same object to key and API

export function ExampleCustomerTransactionsList() {
  const page = 1;
  const limit = 10;
  const status = "PENDING";

  const params: TransactionsListParams = { page, limit, status };

  const query = useFetchData(
    [...customerKeys.transactions.list(params)],
    () => customerApi.transactions.list(params),
    true,
  );

  const { data, isLoading } = query;
  const list = data?.data ?? [];

  return (
    <div>
      {isLoading ? (
        <Skeleton height={200} />
      ) : (
        <div>{list.length} transactions</div>
      )}
    </div>
  );
}

// EXAMPLE 3: Single item (useFetchSingleData)
// Params: id – pass to both query key and API function

export function ExampleTransactionDetail({
  transactionId,
}: {
  transactionId: string | null;
}) {
  const query = useFetchSingleData(
    transactionId != null
      ? [...customerKeys.transactions.detail(transactionId)]
      : [],
    () => customerApi.transactions.getById(transactionId!),
    !!transactionId,
  );

  const { data, isLoading } = query;

  if (!transactionId) return <div>No ID</div>;
  if (isLoading) return <Skeleton height={120} />;
  if (!data) return <div>Not found</div>;

  return <div>Transaction: {data.data.transactionId}</div>;
}

// EXAMPLE 4: Create (useCreateData)
// Params: request body – type comes from the API function

export function ExampleCreateTransaction() {
  const createMutation = useCreateData(customerApi.transactions.create);

  const handleCreate = () => {
    createMutation.mutate(
      {
        type: "PTA",
        amount: 5000,
        currency: "USD",
        purpose: "Travel",
        beneficiaryDetails: {},
        destinationCountry: "US",
      },
      {
        onSuccess: () => {},
        onError: (err) => handleApiError(err),
      },
    );
  };

  return (
    <button
      type="button"
      onClick={handleCreate}
      disabled={createMutation.isPending}
    >
      {createMutation.isPending ? "Creating…" : "Create"}
    </button>
  );
}

// EXAMPLE 5: Update (usePutData)
// Params: wrap in a function so you pass (data) => api.update(id, data)

export function ExampleUpdateTransaction({
  transactionId,
}: {
  transactionId: string;
}) {
  const updateMutation = usePutData((data: UpdateTransactionRequest) =>
    customerApi.transactions.update(transactionId, data),
  );

  const handleUpdate = () => {
    updateMutation.mutate(
      { amount: 6000, purpose: "Updated purpose" },
      { onError: (err) => handleApiError(err) },
    );
  };

  return (
    <button
      type="button"
      onClick={handleUpdate}
      disabled={updateMutation.isPending}
    >
      Update
    </button>
  );
}

// EXAMPLE 6: Upload (useUploadData)
// Params: FormData – build in handler and pass to mutate()

export function ExampleUploadDocuments({
  transactionId,
}: {
  transactionId: string;
}) {
  const uploadMutation = useUploadData((formData: FormData) =>
    customerApi.transactions.uploadDocuments(transactionId, formData),
  );

  const handleUpload = (files: FileList | null) => {
    if (!files?.length) return;
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("documents", file));
    uploadMutation.mutate(formData, { onError: (err) => handleApiError(err) });
  };

  return (
    <input
      type="file"
      multiple
      onChange={(e) => handleUpload(e.target.files)}
      disabled={uploadMutation.isPending}
    />
  );
}

// EXAMPLE 7: Login (useCreateData) – no query key, mutation only

export function ExampleLogin() {
  const loginMutation = useCreateData(customerApi.auth.login);

  const handleLogin = () => {
    loginMutation.mutate(
      { email: "user@example.com", password: "password" },
      { onError: (err) => handleApiError(err) },
    );
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={loginMutation.isPending}
    >
      Login
    </button>
  );
}

// EXAMPLE 8: Dashboard stats (no params – key has no args)
// To use the raw data without "unknown", pass a type to the hook: useFetchData<YourType>(...)

interface DashboardStatsResponse {
  totalUsers?: number;
  totalTransactions?: number;
  pendingApprovals?: number;
  [key: string]: unknown;
}

export function ExampleAdminDashboardStats() {
  const query = useFetchData<DashboardStatsResponse>(
    [...adminKeys.dashboard.stats()],
    () =>
      adminApi.dashboard.getStats() as unknown as Promise<DashboardStatsResponse>,
    true,
  );

  const { data, isLoading } = query;

  return (
    <div>
      {isLoading ? (
        <Skeleton />
      ) : data != null ? (
        <div>
          {data.totalUsers != null && <span>Users: {data.totalUsers}</span>}
          {data.totalTransactions != null && (
            <span>Transactions: {data.totalTransactions}</span>
          )}
          {data.pendingApprovals != null && (
            <span>Pending: {data.pendingApprovals}</span>
          )}
        </div>
      ) : (
        "No data"
      )}
    </div>
  );
}

// QUICK REFERENCE – query key + params summary
/*
  Customer:
    - customerKeys.transactions.list({ page, limit, status })
    - customerKeys.transactions.detail(id)
    - customerKeys.payments.history({ page, limit })
    - customerKeys.payments.status(transactionId)
    - customerKeys.auth.profile()
    - customerKeys.kyc.passportStatus()

  Admin:
    - adminKeys.customers.list({ page, limit })
    - adminKeys.customers.detail(userId)
    - adminKeys.transactions.list({ page, limit, status })
    - adminKeys.dashboard.stats()
    - adminKeys.dashboard.pendingApprovals()

  Hooks (pass type to get typed data, e.g. useFetchData<MyResponse>(...)):
    - useFetchData(key, fn, enabled)           → list, refetch
    - useFetchDataSeperateLoading(key, fn, enabled) → list with isLoading + isFetching
    - useFetchSingleData(key, fn, enabled)    → single resource by id
    - useCreateData(fn)                        → POST
    - usePutData(fn)                           → PUT
    - useUploadData(fn)                        → multipart/form-data
    - useDeleteData(fn)                        → DELETE
*/
