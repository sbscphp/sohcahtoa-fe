"use client";

import Image from "next/image";
import { type ReactNode } from "react";
import { actionBtnIcon } from "@/app/assets/asset";

interface ActionButtonProps {
  onClick: () => void;
  icon?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function ActionButton({
  onClick,
  icon,
  className = "",
  "aria-label": ariaLabel = "View details",
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w- h-10 flex items-center justify-center cursor-pointer ${className}`}
      aria-label={ariaLabel}
    >
      {icon ?? (
        <Image
          src={actionBtnIcon.src}
          alt=""
          width={20}
          height={20}
          className="object-contain size-10"
        />
      )}
    </button>
  );
}
