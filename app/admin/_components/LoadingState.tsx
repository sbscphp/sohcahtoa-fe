"use client";

import { Card, Skeleton, Stack } from "@mantine/core";

interface LoadingStateProps {
  title?: string;
  description?: string;
  rows?: number;
}

export default function LoadingState({
  title = "Loading...",
  description = "Please wait while we fetch the data.",
  rows = 5,
}: LoadingStateProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <div className="space-y-4">
        {/* Title and description skeletons */}
        <div className="space-y-2">
          <Skeleton height={20} width="30%" />
          <Skeleton height={14} width="50%" />
        </div>

        {/* Table header skeleton */}
        <div className="flex gap-4 py-3 border-b border-gray-200">
          <Skeleton height={16} width="20%" />
          <Skeleton height={16} width="25%" />
          <Skeleton height={16} width="15%" />
          <Skeleton height={16} width="10%" />
        </div>

        {/* Table rows skeleton */}
        <Stack gap="md">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex gap-4 items-center py-2">
              <Skeleton height={16} width="20%" />
              <div className="space-y-1">
                <Skeleton height={14} width="120px" />
                <Skeleton height={12} width="80px" />
              </div>
              <Skeleton height={24} width="80px" radius="xl" />
              <Skeleton height={32} width={32} circle />
            </div>
          ))}
        </Stack>
      </div>
    </Card>
  );
}
