"use client";

import { EmptyState } from "@/app/(customer)/_components/common";
import { underReview } from "@/app/assets/asset";
import type { DetailViewStatus } from "@/app/(customer)/_lib/transaction-details";
import type { TransactionDetailComment } from "@/app/_lib/api/types";
import { formatShortDate, formatShortTime } from "@/app/utils/helper/formatLocalDate";
import ApprovedStatus from "./ApprovedStatus";
import RejectedStatus from "./RejectedStatus";
import type { ReactNode } from "react";

interface OverviewDetailProps {
  viewStatus: DetailViewStatus;
  transactionId?: string;
  date?: string;
  time?: string;
  adminMessage?: string;
  onProceedToPayment?: () => void;
  approvedActions?: ReactNode;
  comments?: TransactionDetailComment[];
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
}: Readonly<OverviewDetailProps>) {
  const sortedComments = [...comments].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );

  const commentsSection = sortedComments.length ? (
    <div className="w-full mt-4 space-y-2">
      <p className="text-sm font-medium text-[#4D4B4B]">Comments</p>
      {sortedComments.map((comment) => (
        <div
          key={comment.id}
          className="w-full p-3 bg-white border border-gray-100 rounded-lg shadow-sm"
        >
          <p className="text-xs leading-5 text-[#4D4B4B]">{comment.message}</p>
          <p className="mt-2 text-[11px] leading-4 text-[#8F8B8B]">
            {(comment.performedByName ?? "Admin")} ·{" "}
            {formatShortDate(comment.createdAt)} {formatShortTime(comment.createdAt)}
          </p>
        </div>
      ))}
    </div>
  ) : null;

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
          {adminMessage && (
            <div className="w-full mt-2 flex flex-row justify-center items-center gap-2 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
              <p className="w-full text-xs leading-4 text-[#4D4B4B]">{adminMessage}</p>
            </div>
          )}
          {commentsSection}
        </div>
      </div>
    );
  }

  if (viewStatus === "approved") {
    return (
      <div className="px-4 pb-8">
        {approvedActions ? (
          <div className="flex flex-col items-center py-5">
            <div className="w-full min-h-[500px] ">
              <div className="w-full flex flex-col items-center gap-4 p-3 bg-success-100 rounded-lg">
                <div className="flex flex-col gap-2 w-full">
                  <div className="space-y-1">
                    <h3 className="font-medium text-base leading-6 text-[#323131]">Request Approved</h3>
                    <span className="text-xs leading-4 text-[#4D4B4B]">ID:{transactionId}</span>
                    <div className="flex flex-row flex-wrap gap-2 items-center w-full">
                      <span className="text-xs leading-4 text-body-text-300">{date}</span>
                      <span className="text-xs leading-4 text-body-text-300">{time}</span>
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-row justify-center items-center gap-2 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <p className="w-full text-xs leading-4 text-[#4D4B4B]">{adminMessage}</p>
                </div>
              </div>
            </div>

            <div className="w-full mt-4 space-y-3">{approvedActions}</div>
          </div>
        ) : (
          <ApprovedStatus
            transactionId={transactionId}
            date={date}
            time={time}
            adminMessage={adminMessage}
            onProceedToPayment={onProceedToPayment}
          />
        )}
        {/* {commentsSection} */}
      </div>
    );
  }

  // if (viewStatus === "deposit_confirmed") {
  //   return (
  //     <div className="px-4 pb-8">
  //       {approvedActions ? (
  //         <div className="flex flex-col items-center py-5">
  //           <div className="w-full min-h-[500px] ">
  //             <div className="w-full flex flex-col items-center gap-4 p-3 bg-success-100 rounded-lg">
  //               <div className="flex flex-col gap-2 w-full">
  //                 <div className="space-y-1">
  //                   <h3 className="font-medium text-base leading-6 text-[#323131]">Request Approved</h3>
  //                   <span className="text-xs leading-4 text-[#4D4B4B]">ID:{transactionId}</span>
  //                   <div className="flex flex-row flex-wrap gap-2 items-center w-full">
  //                     <span className="text-xs leading-4 text-body-text-300">{date}</span>
  //                     <span className="text-xs leading-4 text-body-text-300">{time}</span>
  //                   </div>
  //                 </div>
  //               </div>
  //               <div className="w-full flex flex-row justify-center items-center gap-2 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
  //                 <p className="w-full text-xs leading-4 text-[#4D4B4B]">{adminMessage}</p>
  //               </div>
  //             </div>
  //           </div>

  //           <div className="w-full mt-4 space-y-3">{approvedActions}</div>
  //         </div>
  //       ) : (
  //         <ApprovedStatus
  //           transactionId={transactionId}
  //           date={date}
  //           time={time}
  //           adminMessage={adminMessage}
  //           onProceedToPayment={onProceedToPayment}
  //         />
  //       )}
  //       {/* {commentsSection} */}
  //     </div>
  //   );
  // }

  if (viewStatus === "rejected") {
    return (
      <div className="px-4 pb-8">
        <RejectedStatus
          transactionId={transactionId}
          date={date}
          time={time}
          adminMessage={adminMessage}
        />
        {commentsSection}
      </div>
    );
  }

  if (viewStatus === "awaiting_disbursement") {
    return (
      <div className="flex flex-col items-center px-4 pt-6 pb-8">
        <div className="w-full max-w-[335px] text-center">
          <p className="text-[#8F8B8B] text-base leading-6">
            Your request has been approved. Funds are being prepared for disbursement.
          </p>
          {commentsSection}
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
          {commentsSection}
        </div>
      </div>
    );
  }

  return null;
}
