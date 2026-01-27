"use client";

import { Text } from "@mantine/core";

interface DetailItemProps {
  label: string;
  value: string;
}

export function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="space-y-1">
      <Text size="xs" className="text-body-text-50!" mb={4}>
        {label}
      </Text>
      <Text fw={500} className="wrap-break-word">
        {value}
      </Text>
    </div>
  );
}
