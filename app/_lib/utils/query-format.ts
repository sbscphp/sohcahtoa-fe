"use client";

import type { DatesRangeValue } from "@mantine/dates";
import { formatLocalDate } from "@/app/utils/helper/formatLocalDate";

export function toCsvParam(values?: string[] | null): string | undefined {
  return values?.length ? values.join(",") : undefined;
}

export function toDateOnlyParam(value: Date | string | null | undefined): string | undefined {
  const out = formatLocalDate(value, "yyyy-MM-dd");
  return out || undefined;
}

export function toDateRangeParams(dateRange: DatesRangeValue | null | undefined): {
  startDate?: string;
  endDate?: string;
} {
  return {
    startDate: toDateOnlyParam(dateRange?.[0] ?? null),
    endDate: toDateOnlyParam(dateRange?.[1] ?? null),
  };
}

