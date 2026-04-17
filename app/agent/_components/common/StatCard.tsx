"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { Money01Icon } from "@hugeicons/core-free-icons";

interface StatCardProps {
  icon: typeof Money01Icon;
  label: string;
  value: string | number;
  iconBgColor: string;
  iconColor: string;
}

export default function StatCard({
  icon,
  label,
  value,
  iconBgColor,
  iconColor,
}: StatCardProps) {
  return (
    <div className="flex flex-col items-start p-4 gap-2 bg-white border-[1.5px] border-gray-100 rounded-xl flex-none grow">
      {/* Main Content */}
      <div className="flex flex-row items-center gap-2 w-full">
        {/* Icon Container */}
        <div
          className={`${iconBgColor} w-10 h-10 rounded-[10px] flex items-center justify-center flex-none shrink-0`}
        >
          <HugeiconsIcon icon={icon} className={`${iconColor} w-6 h-6`} />
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
          {/* Label */}
          <p className="text-[12px] leading-4 tracking-[0.04px] text-[#8F8B8B] font-normal">
            {label}
          </p>
          {/* Value */}
          <p className="text-[18px] leading-[26px] text-[#323131] font-bold">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
