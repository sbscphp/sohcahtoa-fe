"use client";

import { Text } from "@mantine/core";
import { SearchX } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
}

export default function EmptyState({
  title = "No Data Available",
  description = "No data here yet. Customers will be populated as they create accounts on Sohcahtoa",
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Icon */}
      <div className="mb-4 text-gray-300">
        {icon || <SearchX size={64} strokeWidth={1.5} />}
      </div>

      {/* Title */}
      <Text fw={600} size="lg" c="dark" mb="xs">
        {title}
      </Text>

      {/* Description */}
      <Text size="sm" c="dimmed" ta="center" maw={400}>
        {description}
      </Text>
    </div>
  );
}
