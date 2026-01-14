"use client";

import { Card } from "@mantine/core";
import EmptyState from "./EmptyState";
import { ReactNode } from "react";

interface EmptySectionProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  format?: "primary" | "secondary";
}

export default function EmptySection({
  title,
  description,
  icon,
  format = "primary",
}: EmptySectionProps) {
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
