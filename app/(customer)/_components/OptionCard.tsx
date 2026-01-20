"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

type OptionCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaText: string;
  href?: string;
  onClick?: () => void;
};

const ctaClassName =
  "w-full flex items-center justify-between gap-4 bg-bg-sidebar px-6 py-4 transition-colors hover:bg-primary-25!";

export default function OptionCard({
  icon,
  title,
  description,
  ctaText,
  href,
  onClick
}: OptionCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border-[1.5px] border-text-50 bg-white">
      <div className="flex flex-1 flex-row items-start gap-6 px-6 pt-6 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white p-2">
          {icon}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="text-[18px] font-semibold leading-[26px] text-[#4D4B4B]">
            {title}
          </h3>
          <p className="text-base font-normal leading-6 text-[#6C6969]">
            {description}
          </p>
        </div>
      </div>
      {href ? (
        <Link href={href} className={ctaClassName}>
          <span className="text-base font-medium leading-6 text-primary-400">
            {ctaText}
          </span>
          <ArrowUpRight size={14} className="text-primary-400" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className={ctaClassName}
        >
          <span className="text-base font-medium leading-6 text-primary-400">
            {ctaText}
          </span>
          <ArrowUpRight size={14} className="text-primary-400" />
        </button>
      )}
    </div>
  );
}
