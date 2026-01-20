"use client";

import { Badge } from "@mantine/core";

const statusColorMap: Record<string, string> = {
  Pending: "orange",
  Completed: "green",
  Rejected: "red",
  "Request More Info": "violet",
  Unread: "orange",
  Read: "gray",
  Active: "green",
  Inactive: "gray",
  Approved: "green",
  Declined: "red",
};

interface StatusBadgeProps {
  status: string;
  color?: string;
  variant?: "light" | "filled" | "outline" | "dot" | "gradient";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  radius?: "xs" | "sm" | "md" | "lg" | "xl";
  defaultColor?: string;
  bg?: string;
}

export function StatusBadge({
  status,
  color,
  variant = "light",
  size = "sm",
  radius = "xl",
  defaultColor = "blue",
  bg,
}: StatusBadgeProps) {
  // Determine the color to use
  const badgeColor =
    color || statusColorMap[status] || defaultColor;

  return (
    <Badge
      color={badgeColor}
      variant={variant}
      className="capitalize!"
      radius={radius}
      size={size}
      bg={bg}
    >
      {status}
    </Badge>
  );
}
