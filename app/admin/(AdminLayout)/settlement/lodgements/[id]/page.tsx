"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import EmptySection from "@/app/admin/_components/EmptySection";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import {
  formatLodgmentAmount,
  getLodgmentDetail,
  lodgmentVarianceLabel,
  type LodgmentStatus,
} from "../../_data/fxInventoryMock";
import LodgmentTakeAction from "../../_components/LodgmentTakeAction";

const CONFIRMED_GREEN = "#027A48";

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function confirmationStamp(date: Date) {
  const dateLabel = date
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .replace(", ", " ");
  const timeLabel = date
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    .toLowerCase();
  return { dateLabel, timeLabel };
}

export default function ViewLodgmentPage() {
  const params = useParams<{ id: string }>();
  const detail = getLodgmentDetail(params.id);

  if (!detail) {
    return (
      <EmptySection
        format="secondary"
        title="Lodgment not found"
        description="This lodgment is not in the current inventory list."
      />
    );
  }

  return <LodgmentDetails key={detail.id} detail={detail} />;
}

function LodgmentDetails({
  detail,
}: {
  detail: NonNullable<ReturnType<typeof getLodgmentDetail>>;
}) {
  const [status, setStatus] = useState<LodgmentStatus>(detail.status);
  const [updatedAmount, setUpdatedAmount] = useState<number | null>(detail.updatedAmount);
  const [updatedBy, setUpdatedBy] = useState(detail.updatedBy);
  const [dateConfirmed, setDateConfirmed] = useState(detail.dateConfirmed);
  const [timeConfirmed, setTimeConfirmed] = useState(detail.timeConfirmed);

  const updatedAmountLabel =
    updatedAmount === null
      ? "-"
      : formatLodgmentAmount(updatedAmount, detail.currency);
  const varianceLabel = lodgmentVarianceLabel(
    detail.returnedAmount,
    updatedAmount,
    detail.currency
  );

  const markConfirmed = () => {
    const stamp = confirmationStamp(new Date());
    setStatus("Confirmed");
    setUpdatedBy("Victoria Paschal");
    setDateConfirmed(stamp.dateLabel);
    setTimeConfirmed(stamp.timeLabel);
  };

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
            <StatusBadge status={status} color={status === "Confirmed" ? CONFIRMED_GREEN : undefined} />
          </div>
        </div>
        {status === "Pending" ? (
          <LodgmentTakeAction
            agentName={detail.agentName}
            currency={detail.currency}
            returnedAmount={detail.returnedAmount}
            updatedAmount={updatedAmount}
            onSaveAmount={setUpdatedAmount}
            onConfirm={markConfirmed}
            onReject={() => setStatus("Rejected")}
          />
        ) : null}
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
          <DetailField label="Updated Amount" value={updatedAmountLabel} />
          <DetailField label="Variance" value={varianceLabel} />
          <DetailField label="Status" value={status} />
          <DetailField label="Updated By" value={updatedBy} />
          <DetailField label="Date Confirmed" value={dateConfirmed} />
          <DetailField label="Time Confirmed" value={timeConfirmed} />
        </div>
      </section>
    </div>
  );
}
