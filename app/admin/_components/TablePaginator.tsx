"use client";

import React from "react";
import { Group, Text, Button, ActionIcon } from "@mantine/core";
import { ArrowLeft, ArrowRight } from "lucide-react";

/* --------------------------------------------
 Types
--------------------------------------------- */
export interface TablePaginatorProps {
  page: number;
  totalPages: number;
  onNext: () => void;
  onPrevious: () => void;
  onPageChange?: (page: number) => void;
}

type PageItem =
  | { type: "page"; page: number; label: string }
  | { type: "ellipsis" };

/* --------------------------------------------
 Helpers
--------------------------------------------- */
function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function buildPageItems(current: number, total: number): PageItem[] {
  if (total <= 1) return total === 1 ? [{ type: "page", page: 1, label: "1" }] : [];

  const WINDOW = 5;
  const windowStart = Math.max(1, current - WINDOW);
  const windowEnd = Math.min(total, current + WINDOW - 1);

  type PageEntry = Extract<PageItem, { type: "page" }>;

  const toEntry = (p: number, label: string): PageEntry => ({
    type: "page",
    page: p,
    label,
  });

  const jumpsBefore: PageEntry[] = [100, 50, 20, 10]
    .map((s) => current - s)
    .filter((p) => p > 1 && p < windowStart)
    .map((p) => toEntry(p, `-${current - p}`));

  const jumpsAfter: PageEntry[] = [10, 20, 50, 100]
    .map((s) => current + s)
    .filter((p) => p < total && p > windowEnd)
    .map((p) => toEntry(p, `+${p - current}`));

  const items: PageItem[] = [];

  if (windowStart > 1) {
    items.push(toEntry(1, "1"));
    if (jumpsBefore.length > 0) {
      if (jumpsBefore[0].page > 2) items.push({ type: "ellipsis" });
      items.push(...jumpsBefore);
    }
    const lastBefore = jumpsBefore.at(-1)?.page ?? 1;
    if (windowStart > lastBefore + 1) items.push({ type: "ellipsis" });
  }

  items.push(...range(windowStart, windowEnd).map((p) => toEntry(p, String(p))));

  if (windowEnd < total) {
    if (jumpsAfter.length > 0) {
      if (jumpsAfter[0].page > windowEnd + 1) items.push({ type: "ellipsis" });
      items.push(...jumpsAfter);
      if (jumpsAfter.at(-1)!.page < total - 1) items.push({ type: "ellipsis" });
    } else if (windowEnd < total - 1) {
      items.push({ type: "ellipsis" });
    }
    items.push(toEntry(total, String(total)));
  }

  return items;
}

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function TablePaginator({
  page,
  totalPages,
  onNext,
  onPrevious,
  onPageChange,
}: TablePaginatorProps) {
  return (
    <Group justify="space-between" mt="lg">
      <Button
        variant="default"
        leftSection={<ArrowLeft size={16} />}
        disabled={page === 1}
        onClick={onPrevious}
      >
        Previous
      </Button>

      <Group gap={6}>
        {buildPageItems(page, totalPages).map((item, i) => {
          if (item.type === "ellipsis") {
            return (
              <Text key={`ellipsis-${i}`} size="sm" c="dimmed" px={4}>
                …
              </Text>
            );
          }

          const isActive = item.page === page;
          return (
            <ActionIcon
              key={`page-${item.page}-${i}`}
              radius="md"
              size="lg"
              variant={isActive ? "filled" : "subtle"}
              color={isActive ? "#F8DCCD" : "gray"}
              c={isActive ? "#DD4F05" : "#667085"}
              onClick={() => onPageChange?.(item.page)}
              title={item.label !== String(item.page) ? `Jump to page ${item.page}` : undefined}
            >
              <Text size="xs" fw={isActive ? 700 : 400}>
                {item.label}
              </Text>
            </ActionIcon>
          );
        })}
      </Group>

      <Button
        variant="default"
        rightSection={<ArrowRight size={16} />}
        disabled={page === totalPages}
        onClick={onNext}
      >
        Next
      </Button>
    </Group>
  );
}