"use client";

import Image from "next/image";
import { emptyState } from "@/app/assets/asset";

interface EmptyStateProps {
  /** Optional custom image source; defaults to the shared emptyState asset */
  imageSrc?: string;
  /** Main heading, e.g. "No Data available" */
  title?: string;
  /** Supporting text below the title */
  description?: string;
  /** Optional extra class name for the root container */
  className?: string;
}

export function EmptyState({
  imageSrc,
  title = "No Data available",
  description,
  className = "",
}: EmptyStateProps) {
  const src = imageSrc ?? emptyState;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center gap-4 py-6 ${className}`}
    >
      <div className="relative w-20 h-20 shrink-0">
        <Image
          src={src}
          alt=""
          width={80}
          height={80}
          className="object-contain"
        />
      </div>
      <h3 className="text-[#333333] font-semibold text-lg leading-7">
        {title}
      </h3>
      {description && (
        <p className="text-[#666666] font-normal text-sm leading-5 max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
}
