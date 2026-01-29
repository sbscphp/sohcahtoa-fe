"use client";

import { Calendar, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";

export type NotificationItemProps = {
  title: string;
  context: string;
  date: string;
  time: string;
  status?: "unread" | "read";
  href?: string;
  onClick?: () => void;
};

export default function NotificationItem({
  title,
  context,
  date,
  time,
  status = "read",
  href,
  onClick,
}: NotificationItemProps) {
  const content = (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h3 className="text-base font-medium leading-6 text-[#4D4B4B]">
          {title}
        </h3>
        <p className="text-sm font-normal leading-5 text-[#8F8B8B] text-wrap line-clamp-1 truncate hover:line-clamp-2">
          {context}
        </p>
        <div className="flex flex-row items-center gap-2">
          <div className="flex items-center gap-1 border-r border-gray-100 pr-2">
            <Calendar className="size-4 shrink-0 text-[#8F8B8B]" />
            <span className="text-sm font-normal leading-5 text-[#8F8B8B]">
              {date}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="size-4 shrink-0 text-[#8F8B8B]" />
            <span className="text-sm font-normal leading-5 text-[#8F8B8B]">
              {time}
            </span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-row items-center gap-2">
        {status === "unread" ? (
          <span className="rounded-2xl bg-warning-50 px-2 py-0.5 text-xs font-medium leading-4 tracking-[0.04px] text-warning-700">
            Unread
          </span>
        ) : (
          <span className="text-xs font-medium leading-4 text-[#6C6969]">
            Read
          </span>
        )}
        <ChevronRight className="size-4 shrink-0 text-[#B2AFAF]" />
      </div>
    </>
  );

  const baseClass =
    "flex w-full flex-row items-center justify-between gap-3 rounded-xl border-[1.5px] border-[#F2F4F7] bg-white p-3 text-left transition-colors hover:border-gray-200 hover:bg-gray-50/50";

  if (href) {
    return (
      <Link href={href} className={baseClass}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={baseClass}>
      {content}
    </button>
  );
}
