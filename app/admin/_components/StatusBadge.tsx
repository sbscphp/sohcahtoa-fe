"use client";

import { Badge } from "@mantine/core";

const statusColorMap: Record<string, string> = {
  Pending: "#B54708",
  Completed: "#027A48",
  Success: "#027A48",
  Settled: "#027A48",
  Posted: "#027A48",
  Rejected: "red",
  "Request More Info": "violet",
  Unread: "#B54708",
  Read: "gray",
  Active: "#027A48",
  Inactive: "gray",
  Deactivated: "red",
  Approved: "#027A48",
  Declined: "red",
  "Payment Received": "#027A48",
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
