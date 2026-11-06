"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import EmptySection from "@/app/admin/_components/EmptySection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { getDisbursementDetail } from "../../_data/fxInventoryMock";
import DisbursementTakeActionDrawer from "../../_components/DisbursementTakeActionDrawer";

const CONFIRMED_GREEN = "#027A48";

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function ViewDisbursementPage() {
  const params = useParams<{ id: string }>();
  const detail = getDisbursementDetail(params.id);
  const [takeActionOpen, setTakeActionOpen] = useState(false);

  if (!detail) {
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
              {detail.recordedDate} | {detail.recordedTime}
            </span>
            <StatusBadge
              status={detail.status}
              color={detail.status === "Approved" ? CONFIRMED_GREEN : undefined}
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
          <DetailField label="Date Requested" value={detail.dateRequested} />
          <DetailField label="Time Requested" value={detail.timeRequested} />
          <DetailField label="Currency Type" value={detail.currency} />
          <DetailField label="Requested Amount" value={detail.requestedAmount} />
          <DetailField label="Requestor" value={detail.requestor} />
          <DetailField label="Workflow Stage" value={detail.workflowStageLabel} />
          <DetailField label="Request Status" value={detail.requestStatus} />
          <DetailField label="Purpose" value={detail.purpose} />
        </div>
      </section>

      <section className="border-t border-gray-100 pt-6">
        <h3 className="mb-4 text-sm font-semibold text-primary-400">Current Cash Information</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <DetailField
            label={`Current Inventory Value (${detail.currency})`}
            value={detail.inventoryValue}
          />
          <DetailField label="Amount After Disbursement" value={detail.amountAfterDisbursement} />
        </div>
      </section>

      <DisbursementTakeActionDrawer
        key={detail.id}
        opened={takeActionOpen}
        onClose={() => setTakeActionOpen(false)}
        status={detail.status}
      />
    </div>
  );
}
