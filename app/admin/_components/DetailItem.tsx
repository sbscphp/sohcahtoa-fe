"use client";

import { Skeleton, Text } from "@mantine/core";

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  loading?: boolean;
}

export function DetailItem({ label, value, loading = false }: DetailItemProps) {
  return (
    <div className="space-y-1">
      <Text size="xs" className="text-body-text-50!" mb={4}>
        {label}
      </Text>
      {loading ? (
        <Skeleton height={16} width="70%" radius="sm" />
      ) : (
        <div className="font-medium! wrap-break-word">
          {value}
        </div>
      )}
    </div>
  );
}
