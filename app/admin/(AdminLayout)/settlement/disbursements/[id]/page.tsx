"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAtomValue } from "jotai";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useCreateData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import EmptySection from "@/app/admin/_components/EmptySection";
import LoadingState from "@/app/admin/_components/LoadingState";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { adminUserAtom } from "@/app/admin/_lib/atoms/admin-auth-atom";
import {
  adminApi,
  type ApproveFxInventoryDisbursementPayload,
  type RejectFxInventoryDisbursementPayload,
} from "@/app/admin/_services/admin-api";
import DisbursementTakeActionDrawer from "../../_components/DisbursementTakeActionDrawer";
import { useFxInventoryDisbursement } from "../../hooks/useFxInventoryDisbursement";

const CONFIRMED_GREEN = "#027A48";

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function actionErrorMessage(error: Error) {
  const apiResponse = (error as unknown as ApiError).data as ApiResponse | undefined;
  return (
    apiResponse?.error?.message ??
    error.message ??
    "Unable to update this disbursement. Please try again."
  );
}

export default function ViewDisbursementPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();
  const adminUser = useAtomValue(adminUserAtom);
  const [takeActionOpen, setTakeActionOpen] = useState(false);
  const { detail, isLoading, isError } = useFxInventoryDisbursement(id, {
    adminUserId: adminUser?.id,
  });

  const refreshDisbursement = () => {
    void queryClient.invalidateQueries({
      queryKey: [...adminKeys.fxInventory.disbursement(id)],
    });
    void queryClient.invalidateQueries({
      queryKey: [...adminKeys.fxInventory.all],
    });
  };

  const notifyError = (error: Error) => {
    notifications.show({
      title: "Disbursement update failed",
      message: actionErrorMessage(error),
      color: "red",
    });
  };

  const approveDisbursement = useCreateData(
    (body: ApproveFxInventoryDisbursementPayload) =>
      adminApi.fxInventory.approveDisbursement(id, body),
    {
      onSuccess: refreshDisbursement,
      onError: notifyError,
    }
  );

  const rejectDisbursement = useCreateData(
    (body: RejectFxInventoryDisbursementPayload) =>
      adminApi.fxInventory.rejectDisbursement(id, body),
    {
      onSuccess: refreshDisbursement,
      onError: notifyError,
    }
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !detail) {
    return (
      <EmptySection
        format="secondary"
        title="Disbursement not found"
        description="This disbursement is not in the current inventory list."
      />
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Disburse Reference: <span className="font-bold">{detail.reference}</span>
          </h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <span>
              {detail.requestedDate} | {detail.requestedTime}
            </span>
            <StatusBadge
              status={detail.statusLabel}
              color={detail.statusLabel === "Approved" ? CONFIRMED_GREEN : undefined}
            />
          </div>
        </div>
        <CustomButton buttonType="primary" onClick={() => setTakeActionOpen(true)}>
          Take Action
        </CustomButton>
      </div>

      <section className="py-6">
        <h3 className="mb-4 text-sm font-semibold text-primary-400">Basic Details</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <DetailField label="Agent Name" value={detail.agentName} />
          <DetailField label="Agent ID" value={detail.agentId} />
          <DetailField label="Date Requested" value={detail.requestedDate} />
          <DetailField label="Time Requested" value={detail.requestedTime} />
          <DetailField label="Currency Type" value={detail.currency} />
          <DetailField label="Requested Amount" value={detail.amountLabel} />
          <DetailField label="Requestor" value={detail.requestor} />
          <DetailField label="Workflow Stage" value={detail.workflowStageLabel} />
          <DetailField label="Request Status" value={detail.statusLabel} />
          <DetailField label="Purpose" value={detail.purpose} />
        </div>
      </section>

      <section className="border-t border-gray-100 pt-6">
        <h3 className="mb-4 text-sm font-semibold text-primary-400">Current Cash Information</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <DetailField
            label={`Current Inventory Value (${detail.currency})`}
            value={detail.inventoryValueLabel}
          />
          <DetailField label="Amount After Disbursement" value={detail.amountAfterLabel} />
        </div>
      </section>

      <DisbursementTakeActionDrawer
        opened={takeActionOpen}
        onClose={() => setTakeActionOpen(false)}
        processName={detail.processName}
        statusLabel={detail.statusLabel}
        approvalState={detail.approvalState}
        stages={detail.stages}
        activities={detail.activities}
        canAct={detail.canAct}
        onApprove={async (reason) => {
          await approveDisbursement.mutateAsync({ reason });
        }}
        onReject={async (reason) => {
          await rejectDisbursement.mutateAsync({ reason });
        }}
      />
    </div>
  );
}
