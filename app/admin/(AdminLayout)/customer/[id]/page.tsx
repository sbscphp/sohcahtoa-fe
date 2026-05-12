"use client";

import { useState } from "react";
import { Group, Text, Divider } from "@mantine/core";
import { useRouter, useParams } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { useCustomerDetails } from "../hooks/useCustomerDetails";
import { adminRoutes } from "@/lib/adminRoutes";
import { usePatchData } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { adminKeys } from "@/app/_lib/api/query-keys";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import CustomerTransactionsTable from "../_customerComponents/CustomerTransactionTable";

export type CustomerStatus = "Active" | "Deactivated";

function toCustomerStatus(status?: string): CustomerStatus {
  return status?.toUpperCase() === "ACTIVE" ? "Active" : "Deactivated";
}

export default function CustomerDetailsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const customerId = params?.id ?? "";
  const { customer, isLoading } = useCustomerDetails(customerId);
  const [statusOverride, setStatusOverride] = useState<CustomerStatus | null>(null);
  const [lastActionPastTense, setLastActionPastTense] = useState<
    "Deactivated" | "Reactivated" | null
  >(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const customerName = customer?.name ?? "—";
  const dateJoined = customer?.dateJoined
    ? new Date(customer.dateJoined).toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";
  const lastActive = customer?.lastActive
    ? new Date(customer.lastActive).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";
  const currentStatus: CustomerStatus =
    statusOverride ?? toCustomerStatus(customer?.status);

  // Track which action the user is taking so copy can adapt
  const isCurrentlyActive = currentStatus === "Active";
  const actionVerb = isCurrentlyActive ? "Deactivate" : "Reactivate";
  const pastTenseVerb = isCurrentlyActive ? "Deactivated" : "Reactivated";

  const toggleCustomerStatusMutation = usePatchData(
    (payload: Record<string, never>) => {
      void payload;
      return adminApi.customers.toggleStatus(customerId);
    },
    {
      onSuccess: async () => {
        const nextStatus: CustomerStatus = isCurrentlyActive ? "Deactivated" : "Active";
        const actionDone: "Deactivated" | "Reactivated" = isCurrentlyActive
          ? "Deactivated"
          : "Reactivated";
        setStatusOverride(nextStatus);
        setLastActionPastTense(actionDone);
        setIsConfirmOpen(false);
        setIsSuccessOpen(true);
        notifications.show({
          title: `Customer ${actionDone}`,
          message: `Customer has been ${actionDone.toLowerCase()} successfully.`,
          color: "green",
        });
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.customers.all],
          }),
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.customers.detail(customerId)],
          }),
        ]);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Status Update Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to update customer status. Please try again.",
          color: "red",
        });
      },
    }
  );

  const handleToggleClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!customerId || toggleCustomerStatusMutation.isPending) return;
    toggleCustomerStatusMutation.mutate({});
  };

  const handleViewAllCustomers = () => {
    router.push(adminRoutes.adminCustomer());
  };

  return (
    <div className="space-y-6">
      {/* Customer header card */}
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <Text size="xl" fw={600}>
                {customerName}
              </Text>

              <Group gap={8} className="flex-wrap text-sm text-[#6B7280]">
                <span>
                  Date Joined: {dateJoined}
                </span>
                <StatusBadge status={currentStatus} />
              </Group>
            </div>

            <CustomButton
              buttonType="secondary"
              onClick={handleToggleClick}
              disabled={toggleCustomerStatusMutation.isPending}
            >
              {isCurrentlyActive ? "Deactivate Customer" : "Reactivate Customer"}
            </CustomButton>
          </div>

          <Divider className="my-2" />

          {/* Customer detail grid */}
          <section className="space-y-4">
            <div className="grid gap-6 md:grid-cols-4">
              <DetailItem
                label="Customer ID"
                value={customer?.id ?? customerId.toString() ?? "—"}
                loading={isLoading}
              />
              <DetailItem
                label="Email Address"
                value={customer?.email ?? "—"}
                loading={isLoading}
              />
              <DetailItem
                label="Phone Number"
                value={customer?.phoneNumber ?? "—"}
                loading={isLoading}
              />
              <DetailItem
                label="Number of Transaction"
                value={String(customer?.totalTransactions ?? 0)}
                loading={isLoading}
              />
              <DetailItem
                label="Transaction Volume"
                value={String(customer?.transactionVolume ?? 0)}
                loading={isLoading}
              />
              <DetailItem
                label="Last Active"
                value={lastActive}
                loading={isLoading}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Transactions table */}
      
      <CustomerTransactionsTable customerId={customerId} />

      {/* Deactivate / Reactivate confirmation modal */}
      <ConfirmationModal
        opened={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={`${actionVerb} Customer ?`}
        message={`Are you sure you want to ${actionVerb.toLowerCase()} this customer profile? Kindly note that this action implies the customer will ${
          isCurrentlyActive
            ? "no longer be able to access both the mobile app and web app."
            : "again be able to access both the mobile app and web app."
        }`}
        primaryButtonText={`Yes, ${actionVerb} Customer`}
        secondaryButtonText="No, Close"
        onPrimary={handleConfirm}
        loading={toggleCustomerStatusMutation.isPending}
      />

      {/* Success modal */}
      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={`Customer ${lastActionPastTense ?? pastTenseVerb}`}
        message={`Customer profile has been successfully ${(lastActionPastTense ?? pastTenseVerb).toLowerCase()}.`}
        primaryButtonText="View All Customer"
        onPrimaryClick={handleViewAllCustomers}
        secondaryButtonText="No, Close"
      />
    </div>
  );
}