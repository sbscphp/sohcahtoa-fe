"use client";

import { Badge } from "@mantine/core";
import { TransactionStatus } from "../../_types/dashboard";

const statusColorMap: Record<TransactionStatus, string> = {
  Pending: "orange",
  Completed: "green",
  Rejected: "red",
  "Request More Info": "violet",
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <Badge
      color={statusColorMap[status]}
      variant="light"
      radius="xl"
      size="sm"
    >
      {status}
    </Badge>
  );
}
