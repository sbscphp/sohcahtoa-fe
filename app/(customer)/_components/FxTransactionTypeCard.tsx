"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

export type FxTransactionTypeCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
};

const baseClass =
  "flex w-full flex-row items-center gap-3 rounded-lg border-[1.5px] border-[#F2F4F7] bg-white p-3 text-left shadow-[0px_1px_2px_rgba(16,24,40,0.05)] transition-colors hover:border-gray-200 hover:bg-gray-50/50";

export default function FxTransactionTypeCard({
  icon,
  title,
  description,
  href,
  onClick,
}: FxTransactionTypeCardProps) {
  const content = (
    <>
      <div className="flex h-6 w-6 shrink-0 items-center justify-center text-primary-400 [&>svg]:size-6">
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3 className="text-base font-semibold leading-6 text-[#4D4B4B]">
          {title}
        </h3>
        <p className="text-sm font-normal leading-5 text-[#6C6969]">
          {description}
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-[#B2AFAF]" />
    </>
  );

  if (href) {
    return <Link href={href} className={baseClass}>{content}</Link>;
  }
  return (
    <button type="button" onClick={onClick} className={baseClass}>
      {content}
    </button>
  );
}
