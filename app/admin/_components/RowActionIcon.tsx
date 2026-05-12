"use client";

import { ActionIcon } from "@mantine/core";
import { ChevronRight } from "lucide-react";

interface RowActionIconProps {
  /** Click handler for the action icon */
  onClick: () => void;
  /** Mantine color for the icon background - defaults to "orange" */
  color?: string;
  /** Mantine radius - defaults to "xl" */
  radius?: number | "xs" | "sm" | "md" | "lg" | "xl";
  /** Mantine variant - defaults to "light" */
  variant?: "subtle" | "light" | "outline" | "transparent" | "default" | "filled";
  /** Width of the icon button - defaults to 10 */
  w?: number;
  /** Height of the icon button - defaults to 10 */
  h?: number;
  /** Size of the chevron icon - defaults to 14 */
  iconSize?: number;
  icon?: React.ReactNode;
}

export default function RowActionIcon({
  onClick,
  radius = "xl",
  variant = "filled",
  w = 16,
  h = 16,
  iconSize = 14,
  icon= <ChevronRight size={iconSize} />
}: RowActionIconProps) {
  return (
    <div
      className="inline-flex items-center justify-center p-2 rounded-lg bg-primary-0 hover:bg-primary-25 transition-all duration-300"
    >
      <ActionIcon
        radius={radius}
        variant={variant}
        w={w}
        h={h}
        className="text-orange-500! bg-[#f1b393]!"
        onClick={onClick}
      >
        {icon}
      </ActionIcon>
    </div>
  );
}

