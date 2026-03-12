"use client";

import { Card, Text } from "@mantine/core";
import EmptyState from "./EmptyState";
import { ReactNode } from "react";

interface EmptySectionProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  format?: "primary" | "secondary" | "compact";
}

export default function EmptySection({
  title,
  description,
  icon,
  format = "primary",
}: EmptySectionProps) {
  if (format === "compact") {
    return (
      <div className="rounded-md border border-dashed border-[#E1E0E0] px-4 py-8 text-center">
        <Text fw={600} size="sm">
          {title ?? "No Data Available"}
        </Text>
        <Text size="xs" c="dimmed" mt={6}>
          {description ?? "No data is currently available for this section."}
        </Text>
      </div>
    );
  }

  if (format === "secondary") {
    // Just return EmptyState without card wrapper
    return <EmptyState title={title} description={description} icon={icon} />;
  }

  // Primary format wraps EmptyState in a card
  return (
    <Card withBorder radius="md" padding="lg">
      <EmptyState title={title} description={description} icon={icon} />
    </Card>
  );
}
