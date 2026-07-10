/**
 * Simulate payment API — DevOps / staging test helpers
 */

"use client";

import { notifications } from "@mantine/notifications";
import { apiClient, type ApiError, type ApiResponse } from "@/app/_lib/api/client";
import { API_ENDPOINTS } from "@/app/_lib/api/endpoints";
import { useCreateData } from "@/app/_lib/api/hooks";

// ==================== Types ====================

export interface SimulatePaymentSourceFields {
  transactionId: string;
  sourceAccountName: string;
  sourceBankName: string;
  sourceAccountNumber: string;
}

export type SimulateExactPaymentPayload = SimulatePaymentSourceFields;

export interface SimulateOverpaymentPayload extends SimulatePaymentSourceFields {
  overageAmount: number;
}

export interface SimulateSplitPaymentPayload extends SimulatePaymentSourceFields {
  splitAmount: number;
}

export interface SimulatePaymentVerifyData {
  transactionId: string;
  status: string;
  deposits?: unknown[];
  [key: string]: unknown;
}

// ==================== API ====================

export const simulatePaymentsApi = {
  exact: (data: SimulateExactPaymentPayload) =>
    apiClient.post<ApiResponse<unknown>>(
      API_ENDPOINTS.simulate.payments.exact,
      data,
      { skipAuth: true }
    ),

  overpayment: (data: SimulateOverpaymentPayload) =>
    apiClient.post<ApiResponse<unknown>>(
      API_ENDPOINTS.simulate.payments.overpayment,
      data,
      { skipAuth: true }
    ),

  split: (data: SimulateSplitPaymentPayload) =>
    apiClient.post<ApiResponse<unknown>>(
      API_ENDPOINTS.simulate.payments.split,
      data,
      { skipAuth: true }
    ),

  verify: (transactionId: string) =>
    apiClient.get<ApiResponse<SimulatePaymentVerifyData>>(
      API_ENDPOINTS.simulate.payments.verify(transactionId),
      { skipAuth: true }
    ),
};

// ==================== Hooks ====================

function notifySimulateError(title: string, error: Error) {
  const apiResponse = (error as unknown as ApiError).data as ApiResponse | undefined;
  notifications.show({
    title,
    message:
      apiResponse?.error?.message ??
      error.message ??
      "Simulation request failed.",
    color: "red",
  });
}

export function useSimulateExactPayment() {
  return useCreateData(simulatePaymentsApi.exact, {
    onSuccess: (data) => {
      notifications.show({
        title: "Exact payment simulated",
        message: data.message || "Transaction should move to DEPOSIT_CONFIRMED.",
        color: "green",
      });
    },
    onError: (error) => notifySimulateError("Exact payment failed", error),
  });
}

export function useSimulateOverpayment() {
  return useCreateData(simulatePaymentsApi.overpayment, {
    onSuccess: (data) => {
      notifications.show({
        title: "Overpayment simulated",
        message: data.message || "Transaction set to DEPOSIT_PENDING for review.",
        color: "green",
      });
    },
    onError: (error) => notifySimulateError("Overpayment failed", error),
  });
}

export function useSimulateSplitPayment() {
  return useCreateData(simulatePaymentsApi.split, {
    onSuccess: (data) => {
      notifications.show({
        title: "Split payment simulated",
        message: data.message || "Transaction set to DEPOSIT_PENDING for review.",
        color: "green",
      });
    },
    onError: (error) => notifySimulateError("Split payment failed", error),
  });
}

export function useVerifySimulatedPayment() {
  return useCreateData(
    (transactionId: string) => simulatePaymentsApi.verify(transactionId),
    {
      onSuccess: (data) => {
        notifications.show({
          title: "Payment verified",
          message: data.message || "Verification result loaded.",
          color: "green",
        });
      },
      onError: (error) => notifySimulateError("Verify failed", error),
    }
  );
}
