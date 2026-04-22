"use client";

import { EmptyState } from "@/app/(customer)/_components/common";
import { underReview } from "@/app/assets/asset";
import {
  getTransactionOverviewTimelineTitle,
  type DetailViewStatus,
} from "@/app/(customer)/_lib/transaction-details";
import type { TransactionDetailComment } from "@/app/_lib/api/types";
import type { ReactNode } from "react";
import ApprovedStatus from "./ApprovedStatus";
import RejectedStatus from "./RejectedStatus";
import TransactionCommentsTimeline from "./TransactionCommentsTimeline";

interface OverviewDetailProps {
  viewStatus: DetailViewStatus;
  transactionId?: string;
  date?: string;
  time?: string;
  adminMessage?: string;
  onProceedToPayment?: () => void;
  approvedActions?: ReactNode;
  comments?: TransactionDetailComment[];
  /** API `currentStep` (e.g. DISBURSEMENT) — used with status for overview title. */
  transactionStage?: string;
  /** API `status` (e.g. DISBURSEMENT_IN_PROGRESS) — used for overview title. */
  transactionStatus?: string;
}

type HeaderTone = "success" | "danger" | "muted";

function OverviewMetaHeader({
  title,
  transactionId,
  date,
  time,
  tone,
}: Readonly<{
  title: string;
  transactionId?: string;
  date?: string;
  time?: string;
  tone: HeaderTone;
}>) {
  const shell =
    tone === "success"
      ? "bg-success-100 border border-emerald-100"
      : tone === "danger"
        ? "bg-pink-50 border border-rose-100"
        : "bg-[#F7F7F7] border border-[#EAECF0]";

  return (
    <div className={`rounded-lg p-4 space-y-1 ${shell}`}>
      <h3 className="font-medium text-base leading-6 text-[#323131]">{title}</h3>
      {transactionId ? (
        <span className="text-xs leading-4 text-[#4D4B4B]">ID: {transactionId}</span>
      ) : null}
      {(date || time) && (
        <div className="flex flex-row flex-wrap gap-2 items-center text-xs text-body-text-300 pt-0.5">
          {date ? <span>{date}</span> : null}
          {time ? <span>{time}</span> : null}
        </div>
      )}
    </div>
  );
}

export default function OverviewDetail({
  viewStatus,
  transactionId,
  date,
  time,
  adminMessage,
  onProceedToPayment,
  approvedActions,
  comments = [],
  transactionStage,
  transactionStatus,
}: Readonly<OverviewDetailProps>) {
  const timelineTitle = getTransactionOverviewTimelineTitle(viewStatus, {
    stage: transactionStage,
    status: transactionStatus,
  });

  const timeline = (
    <TransactionCommentsTimeline
      comments={comments}
      emptyHint="No updates have been posted for this transaction yet."
    />
  );

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
          {adminMessage ? (
            <div className="w-full mt-2 flex flex-row justify-center items-center gap-2 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
              <p className="w-full text-xs leading-4 text-[#4D4B4B]">{adminMessage}</p>
            </div>
          ) : null}
          {comments.length > 0 ? <div className="w-full mt-4">{timeline}</div> : null}
        </div>
      </div>
    );
  }

  if (viewStatus === "rejected") {
    return (
      <div className="px-4 pb-8 space-y-4">
        <OverviewMetaHeader
          title={timelineTitle}
          transactionId={transactionId}
          date={date}
          time={time}
          tone="danger"
        />
        {timeline}
        {adminMessage ? <RejectedStatus variant="messageOnly" adminMessage={adminMessage} /> : null}
      </div>
    );
  }

  const showApprovedStyleHeader =
    viewStatus === "approved" || viewStatus === "disbursement_in_progress";

  if (showApprovedStyleHeader) {
    if (viewStatus === "disbursement_in_progress" && !approvedActions) {
      return (
        <div className="px-4 pb-8 space-y-4">
          <OverviewMetaHeader
            title={timelineTitle}
            transactionId={transactionId}
            date={date}
            time={time}
            tone="muted"
          />
          {timeline}
          <p className="text-sm text-center text-[#8F8B8B] leading-6">
            Your request has been approved. Disbursement is being processed.
          </p>
        </div>
      );
    }

    if (approvedActions) {
      return (
        <div className="mx-auto flex w-full max-w-full flex-col gap-4 px-4 py-5 pb-4">
          <div className="shrink-0">
            <OverviewMetaHeader
              title={timelineTitle}
              transactionId={transactionId}
              date={date}
              time={time}
              tone="success"
            />
          </div>
          <div className="w-full max-h-[min(58vh,30rem)] overflow-y-auto overscroll-contain">
            {timeline}
          </div>
          <div className="w-full shrink-0 space-y-3">{approvedActions}</div>
        </div>
      );
    }

    return (
      <div className="mx-auto flex w-full max-w-full flex-col gap-4 px-4 py-5 pb-4">
        <div className="shrink-0">
          <OverviewMetaHeader
            title={timelineTitle}
            transactionId={transactionId}
            date={date}
            time={time}
            tone="success"
          />
        </div>
        <div className="w-full max-h-[min(58vh,30rem)] overflow-y-auto overscroll-contain">
          {timeline}
        </div>
        {onProceedToPayment ? (
          <div className="shrink-0">
            <ApprovedStatus variant="actionsOnly" onProceedToPayment={onProceedToPayment} />
          </div>
        ) : null}
      </div>
    );
  }

  if (viewStatus === "awaiting_disbursement") {
    return (
      <div className="px-4 pb-8 space-y-4">
        <OverviewMetaHeader
          title={timelineTitle}
          transactionId={transactionId}
          date={date}
          time={time}
          tone="muted"
        />
        {timeline}
        <p className="text-sm text-center text-[#8F8B8B] leading-6">
          Your request has been approved. Funds are being prepared for disbursement.
        </p>
      </div>
    );
  }

  if (viewStatus === "transaction_settled") {
    return (
      <div className="px-4 pb-8 space-y-4">
        <OverviewMetaHeader
          title={timelineTitle}
          transactionId={transactionId}
          date={date}
          time={time}
          tone="success"
        />
        {timeline}
        <p className="text-sm text-center text-[#8F8B8B] leading-6">
          This transaction has been settled. No pending updates.
        </p>
      </div>
    );
  }

  if (viewStatus === "deposit_confirmed") {
    return (
      <div className="px-4 pb-8 space-y-4">
        <OverviewMetaHeader
          title={timelineTitle}
          transactionId={transactionId}
          date={date}
          time={time}
          tone="muted"
        />
        {timeline}
      </div>
    );
  }

  return null;
}
