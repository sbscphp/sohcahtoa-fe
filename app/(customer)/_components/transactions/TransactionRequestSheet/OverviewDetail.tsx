"use client";

import { EmptyState } from "@/app/(customer)/_components/common";
import { underReview } from "@/app/assets/asset";
import type { DetailViewStatus } from "@/app/(customer)/_lib/transaction-details";
import ApprovedStatus from "./ApprovedStatus";
import RejectedStatus from "./RejectedStatus";

interface OverviewDetailProps {
  viewStatus: DetailViewStatus;
  transactionId?: string;
  date?: string;
  time?: string;
  adminMessage?: string;
  onProceedToPayment?: () => void;
}

/** Overview tab content: status-based (under review, approved, rejected, awaiting disbursement, etc.). */
export default function OverviewDetail({
  viewStatus,
  transactionId,
  date,
  time,
  adminMessage,
  onProceedToPayment,
}: OverviewDetailProps) {
  if (viewStatus === "under_review") {
    return (
      <div className="flex flex-col items-center px-4 pt-6 pb-8">
        <div className="w-full max-w-[335px] flex flex-col items-center gap-2">
          <EmptyState
            imageSrc={underReview}
            title="Application is Under Review."
            description="Your document is currently undergoing approval. You will receive a mail notification once your documents is approved."
            className="gap-2 [&_h3]:text-xl [&_h3]:leading-7 [&_h3]:text-[#4D4B4B] [&_p]:text-base [&_p]:leading-6 [&_p]:text-[#8F8B8B] [&_p]:text-center"
          />
        </div>
      </div>
    );
  }

  if (viewStatus === "approved") {
    return (
      <ApprovedStatus
        transactionId={transactionId}
        date={date}
        time={time}
        adminMessage={adminMessage}
        onProceedToPayment={onProceedToPayment}
      />
    );
  }

  if (viewStatus === "rejected") {
    return (
      <RejectedStatus
        transactionId={transactionId}
        date={date}
        time={time}
        adminMessage={adminMessage}
      />
    );
  }

  if (viewStatus === "awaiting_disbursement") {
    return (
      <div className="flex flex-col items-center px-4 pt-6 pb-8">
        <div className="w-full max-w-[335px] text-center">
          <p className="text-[#8F8B8B] text-base leading-6">
            Your request has been approved. Funds are being prepared for disbursement.
          </p>
        </div>
      </div>
    );
  }

  if (viewStatus === "transaction_settled") {
    return (
      <div className="flex flex-col items-center px-4 pt-6 pb-8">
        <div className="w-full max-w-[335px] text-center">
          <p className="text-[#8F8B8B] text-base leading-6">
            This transaction has been settled. No pending updates.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
