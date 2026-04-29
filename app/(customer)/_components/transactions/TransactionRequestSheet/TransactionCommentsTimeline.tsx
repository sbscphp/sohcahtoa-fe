"use client";

import type { TransactionDetailComment } from "@/app/_lib/api/types";
import { getStatusBadge } from "@/app/(customer)/_utils/status-badge";
import { formatShortDate, formatShortTime } from "@/app/utils/helper/formatLocalDate";
import Image from "next/image";
import Connector from "./connector-timeline.png";

function formatCommentAction(action: string): string {
  const raw = action.trim();
  if (!raw) return "Update";
  return raw
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function commentActionBadgeLabel(action: string): string {
  const u = action.trim().toUpperCase();
  if (u.includes("REJECT")) return "Rejected";
  if (u.includes("APPROV")) return "Approved";
  if (u.includes("DISBURSE")) return "Disbursement";
  if (u.includes("DEPOSIT") && u.includes("CONFIRM")) return "Completed";
  if (u.includes("COMPLETE")) return "Completed";
  if (u.includes("REQUEST") && u.includes("INFO")) return "Pending";
  return "Update";
}

function commentActorLabel(comment: TransactionDetailComment): string {
  return (
    comment.performedByName ??
    comment.addedBy ??
    comment.performedBy ??
    "Admin"
  ).trim() || "Admin";
}

interface TransactionCommentsTimelineProps {
  comments: TransactionDetailComment[];
  emptyHint?: string;
}

/** Chained admin/customer updates (same spirit as admin workflow overview). */
export default function TransactionCommentsTimeline({
  comments,
  emptyHint = "No updates have been posted for this transaction yet.",
}: Readonly<TransactionCommentsTimelineProps>) {
  const ordered = [...comments].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
  );

  if (ordered.length === 0) {
    return (
      <div className="rounded-lg border border-[#EAECF0] bg-white p-6 text-center">
        <p className="text-sm font-medium text-[#323131]">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <p className="text-sm font-medium text-[#4D4B4B] mb-3">Activity</p>
      <div className="space-y-1">
        {ordered.map((item, index) => {
          const actor = commentActorLabel(item);
          const initials = actor.slice(0, 2).toUpperCase();
          const badgeLabel = commentActionBadgeLabel(item.action);
          const actionLine = formatCommentAction(item.action);

          return (
            <div key={item.id}>
              <div className="bg-[#F7F7F7] rounded-lg p-4 space-y-3">
                <div className="flex flex-row justify-between items-start gap-3">
                  <div className="flex flex-row items-start gap-3 min-w-0 flex-1">
                    <div
                      className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold text-[#4D4B4B]"
                      style={{ backgroundColor: "#F5B89C" }}
                      aria-hidden
                    >
                      {initials}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium text-[#323131] wrap-break-word">{actor}</p>
                      <p className="text-xs text-[#8F8B8B]">{actionLine}</p>
                      <div className="flex flex-row flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#8F8B8B] pt-0.5">
                        <span className="border-r border-[#E1E0E0] pr-3">
                          {formatShortDate(item.createdAt)} {formatShortTime(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* <div className="shrink-0 text-right">
                    <span
                      className="inline-flex items-center justify-center"
                      style={getStatusBadge(badgeLabel)}
                    >
                      {badgeLabel}
                    </span>
                    <span className="block text-[10px] text-[#8F8B8B] mt-1">Action taken</span>
                  </div> */}
                </div>
                <div className="bg-white border border-[#E1E0E0] rounded-lg p-3">
                  <p className="text-xs text-[#4D4B4B] leading-relaxed whitespace-pre-wrap wrap-break-word">
                    {item.message?.trim() ? item.message : "—"}
                  </p>
                </div>
              </div>
              {index < ordered.length - 1 && (
                <Image src={Connector} alt="" className="ml-5 -my-0.5 h-auto w-auto max-w-[40px]" aria-hidden />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
