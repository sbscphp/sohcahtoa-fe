"use client";

import { Skeleton, Text } from "@mantine/core";
import { isBlankDetailText } from "@/app/(customer)/_components/transactions/details/LabelText";

function isEmptyDetailValue(value: React.ReactNode): boolean {
  if (value == null) return true;
  if (typeof value === "string") return isBlankDetailText(value);
  return false;
}

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  loading?: boolean;
  /** When true, renders nothing after load if the value is missing or a placeholder dash */
  hideWhenEmpty?: boolean;
}

export function DetailItem({
  label,
  value,
  loading = false,
  hideWhenEmpty = false,
}: DetailItemProps) {
  if (hideWhenEmpty && !loading && isEmptyDetailValue(value)) {
    return null;
  }

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
