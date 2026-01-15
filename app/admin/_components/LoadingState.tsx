"use client";

import { Card, Skeleton, Stack } from "@mantine/core";

interface LoadingStateProps {
  title?: string;
  description?: string;
  rows?: number;
  cols?: number;
}

export default function LoadingState({
  rows = 5,
  cols = 4,
}: LoadingStateProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <div className="space-y-4">

        {/* Table header skeleton */}
        <div className="flex gap-4 py-3 border-b border-gray-200">
          {Array.from({ length: cols }).map((_, index) => (
            <Skeleton key={index} height={16} width="20%" />
          ))}
        </div>

        {/* Table rows skeleton */}
        <Stack gap="md">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4 items-center py-2">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <Skeleton key={colIndex} height={16} width="20%" />
              ))}
            </div>
          ))}
        </Stack>
      </div>
    </Card>
  );
}
