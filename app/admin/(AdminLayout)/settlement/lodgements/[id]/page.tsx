"use client";

import { useParams } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useCreateData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import EmptySection from "@/app/admin/_components/EmptySection";
import LoadingState from "@/app/admin/_components/LoadingState";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import {
  adminApi,
  type ConfirmFxInventoryLodgmentPayload,
  type RejectFxInventoryLodgmentPayload,
} from "@/app/admin/_services/admin-api";
import LodgmentTakeAction from "../../_components/LodgmentTakeAction";
import { useFxInventoryLodgment } from "../../hooks/useFxInventoryLodgment";

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
    "Unable to update this lodgment. Please try again."
  );
}

export default function ViewLodgmentPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();
  const { detail, isLoading, isError } = useFxInventoryLodgment(id);

  const refreshLodgment = () => {
    void queryClient.invalidateQueries({
      queryKey: [...adminKeys.fxInventory.lodgment(id)],
    });
    void queryClient.invalidateQueries({
      queryKey: [...adminKeys.fxInventory.all],
    });
  };

  const notifyError = (error: Error) => {
    notifications.show({
      title: "Lodgment update failed",
      message: actionErrorMessage(error),
      color: "red",
    });
  };

  const confirmLodgment = useCreateData(
    (body: ConfirmFxInventoryLodgmentPayload) => adminApi.fxInventory.confirmLodgment(id, body),
    {
      onSuccess: refreshLodgment,
      onError: notifyError,
    }
  );

  const rejectLodgment = useCreateData(
    (body: RejectFxInventoryLodgmentPayload) => adminApi.fxInventory.rejectLodgment(id, body),
    {
      onSuccess: refreshLodgment,
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
        title="Lodgment not found"
        description="This lodgment is not in the current inventory list."
      />
    );
  }

  const confirmAmount = detail.confirmedAmount ?? detail.statedAmount;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Lodge Reference: <span className="font-bold">{detail.reference}</span>
          </h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <span>
              {detail.recordedDate} | {detail.recordedTime}
            </span>
            <StatusBadge
              status={detail.status}
              color={detail.status === "Confirmed" ? CONFIRMED_GREEN : undefined}
            />
          </div>
        </div>
        <LodgmentTakeAction
          canAct={detail.rawStatus === "PENDING_VERIFICATION"}
          agentName={detail.agentName}
          currency={detail.currency}
          returnedAmount={detail.statedAmount ?? 0}
          updatedAmount={detail.confirmedAmount}
          onSaveAmount={async (amount) => {
            await confirmLodgment.mutateAsync({ confirmedAmount: amount, reason: "" });
          }}
          onConfirm={async () => {
            if (confirmAmount == null) {
              notifications.show({
                title: "Lodgment update failed",
                message: "Amount is required",
                color: "red",
              });
              throw new Error("Amount is required");
            }
            await confirmLodgment.mutateAsync({
              confirmedAmount: confirmAmount,
              reason: "",
            });
          }}
          onReject={async () => {
            await rejectLodgment.mutateAsync({ reason: "" });
          }}
        />
      </div>

      <section className="py-6">
        <h3 className="mb-4 text-sm font-semibold text-primary-400">Basic Details</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <DetailField label="Agent Name" value={detail.agentName} />
          <DetailField label="Agent ID" value={detail.agentId} />
          <DetailField label="Date Lodged" value={detail.recordedDate} />
          <DetailField label="Time Lodged" value={detail.recordedTime} />
          <DetailField label="Currency Type" value={detail.currency} />
          <DetailField label="Returned Amount" value={detail.returnedAmountLabel} />
          <DetailField label="Updated Amount" value={detail.updatedAmountLabel} />
          <DetailField label="Variance" value={detail.varianceLabel} />
          <DetailField label="Status" value={detail.status} />
          <DetailField label="Updated By" value={detail.updatedBy} />
          <DetailField label="Date Confirmed" value={detail.dateConfirmed} />
          <DetailField label="Time Confirmed" value={detail.timeConfirmed} />
        </div>
      </section>
    </div>
  );
}
