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
}

export default function RowActionIcon({
  onClick,
  color = "orange",
  radius = "xl",
  variant = "filled",
  w = 32,
  h = 32,
  iconSize = 14,
}: RowActionIconProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 6,
        borderRadius: 16,
        backgroundColor: "rgba(227, 108, 47, 0.08)", // soft peach square
      }}
    >
      <ActionIcon
        radius={radius}
        variant={variant}
        color={color}
        w={w}
        h={h}
        onClick={onClick}
      >
        <ChevronRight size={iconSize} />
      </ActionIcon>
    </div>
  );
}

