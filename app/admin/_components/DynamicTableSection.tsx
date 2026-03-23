"use client";

import React from "react";
import { Table, Text, Group, Button, ActionIcon } from "@mantine/core";
import { ArrowLeft, ArrowRight } from "lucide-react";
import EmptySection from "./EmptySection";
import LoadingState from "./LoadingState";

/* --------------------------------------------
 Types
--------------------------------------------- */
export interface Header {
  label: string;
  key: string;
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onNext: () => void;
  onPrevious: () => void;
  onPageChange?: (page: number) => void;
}

interface DynamicTableSectionProps<T> {
  headers: Header[];
  data: T[];
  loading?: boolean;
  renderItems: (item: T, headers: Header[]) => React.ReactNode[];
  emptyMessage?: string;
  emptyTitle?: string;
  pagination?: PaginationProps;
  onClick?: (item: T) => void;
  isNoBorder?: boolean;
}

/* --------------------------------------------
 Pagination helpers
--------------------------------------------- */
type PageItem =
  | { type: "page"; page: number; label: string }
  | { type: "ellipsis" };

/**
 * Builds the list of items to render in the pagination bar:
 *
 * - A window of up to 10 consecutive pages centred on `current`
 * - Jump markers at ±10 / ±20 / ±50 / ±100 offsets (when inside [1, total])
 * - Always anchors page 1 and `totalPages` at the ends
 * - Ellipsis separators between disjoint groups
 */
function buildPageItems(current: number, total: number): PageItem[] {
  if (total < 1) return [];
  if (total === 1) return [{ type: "page", page: 1, label: "1" }];

  // ── 1. Window of 10 pages around current ──────────────────────────────────
  const WINDOW = 5; // pages on each side → up to 10 visible
  const windowStart = Math.max(1, current - WINDOW);
  const windowEnd = Math.min(total, current + WINDOW - 1);

  const windowPages = range(windowStart, windowEnd);

  type PageEntry = Extract<PageItem, { type: "page" }>;

  // ── 2. Jump markers before the window ─────────────────────────────────────
  const jumpsBefore: PageEntry[] = [100, 50, 20, 10]
    .map((step) => current - step)
    .filter((p) => p > 1 && p < windowStart)
    .map((p) => ({ type: "page" as const, page: p, label: `-${Math.abs(p - current)}` }));

  // ── 3. Jump markers after the window ──────────────────────────────────────
  const jumpsAfter: PageEntry[] = [10, 20, 50, 100]
    .map((step) => current + step)
    .filter((p) => p < total && p > windowEnd)
    .map((p) => ({ type: "page" as const, page: p, label: `+${p - current}` }));

  // ── 4. Assemble groups with ellipsis between gaps ─────────────────────────
  const items: PageItem[] = [];

  // First page anchor
  if (windowStart > 1) {
    items.push({ type: "page", page: 1, label: "1" });

    if (jumpsBefore.length > 0) {
      // Only show ellipsis if there's a real gap between page 1 and first jump
      if (jumpsBefore[0].page > 2) {
        items.push({ type: "ellipsis" });
      }
      items.push(...jumpsBefore);
    }

    if (windowStart > (jumpsBefore.length > 0 ? jumpsBefore[jumpsBefore.length - 1].page + 1 : 2)) {
      items.push({ type: "ellipsis" });
    }
  }

  // Window
  items.push(...windowPages.map((p) => ({ type: "page" as const, page: p, label: String(p) })));

  // Last page anchor
  if (windowEnd < total) {
    if (jumpsAfter.length > 0) {
      if (jumpsAfter[0].page > windowEnd + 1) {
        items.push({ type: "ellipsis" });
      }
      items.push(...jumpsAfter);

      if (jumpsAfter[jumpsAfter.length - 1].page < total - 1) {
        items.push({ type: "ellipsis" });
      }
    } else if (windowEnd < total - 1) {
      items.push({ type: "ellipsis" });
    }

    items.push({ type: "page", page: total, label: String(total) });
  }

  return items;
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function DynamicTableSection<T>({
  headers,
  data,
  loading = false,
  renderItems,
  emptyMessage = "No records found",
  emptyTitle = "No Records Found",
  pagination,
  isNoBorder = false,
}: DynamicTableSectionProps<T>) {
  const renderRowContent = (item: T) => {
    const content = renderItems(item, headers);
    return content.map((value, index) => (
      <Table.Td key={headers[index]?.key ?? index}>{value}</Table.Td>
    ));
  };

  /* --------------------------------------------
     Loading
  --------------------------------------------- */
  if (loading) {
    return <LoadingState cols={headers.length} />;
  }

  /* --------------------------------------------
     Empty
  --------------------------------------------- */
  if (!data || data.length === 0) {
    return (
      <EmptySection
        title={emptyTitle}
        format="secondary"
        description={emptyMessage}
      />
    );
  }

  return (
    <>
      {/* ==============================
          Desktop Table
      ============================== */}
      <div className="hidden sm:block">
        <div className="w-full overflow-x-auto">
          <Table
            verticalSpacing="sm"
            horizontalSpacing="md"
            highlightOnHover
            withTableBorder
            withRowBorders={!isNoBorder}
            className="min-w-200"
          >
            <Table.Thead>
              <Table.Tr>
                {headers.map((header) => (
                  <Table.Th
                    key={header.key}
                    className="text-xs font-semibold text-[#7C8496] whitespace-nowrap bg-[#F8F9FB]"
                  >
                    {header.label}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {data.map((item, index) => (
                <Table.Tr key={index}>{renderRowContent(item)}</Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </div>

      {/* ==============================
          Mobile Cards
      ============================== */}
      <div className="sm:hidden space-y-4 p-4">
        {data.map((item, i) => {
          const content = renderItems(item, headers);

          return (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white space-y-3"
            >
              {headers.map((header, index) => (
                <div key={header.key}>
                  <Text fw={600} size="sm" c="dimmed">
                    {header.label}
                  </Text>
                  <div className="text-sm">{content[index]}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* ==============================
          Pagination
      ============================== */}
      {pagination && (
        <Group justify="space-between" mt="lg">
          {/* Previous */}
          <Button
            variant="default"
            leftSection={<ArrowLeft size={16} />}
            disabled={pagination.page === 1}
            onClick={pagination.onPrevious}
          >
            Previous
          </Button>

          {/* Page Numbers */}
          <Group gap={6}>
            {buildPageItems(pagination.page, pagination.totalPages).map(
              (item, i) => {
                if (item.type === "ellipsis") {
                  return (
                    <Text key={`ellipsis-${i}`} size="sm" c="dimmed" px={4}>
                      …
                    </Text>
                  );
                }

                const { page, label } = item; // narrowed to page item
                const isActive = page === pagination.page;
                return (
                  <ActionIcon
                    key={`page-${page}-${i}`}
                    radius="md"
                    size="lg"
                    variant={isActive ? "filled" : "subtle"}
                    color={isActive ? "#F8DCCD" : "gray"}
                    c={isActive ? "#DD4F05" : "#667085"}
                    onClick={() => pagination.onPageChange?.(page)}
                    title={
                      label !== String(page)
                        ? `Jump to page ${page}`
                        : undefined
                    }
                  >
                    <Text size="xs" fw={isActive ? 700 : 400}>
                      {label}
                    </Text>
                  </ActionIcon>
                );
              }
            )}
          </Group>

          {/* Next */}
          <Button
            variant="default"
            rightSection={<ArrowRight size={16} />}
            disabled={pagination.page === pagination.totalPages}
            onClick={pagination.onNext}
          >
            Next
          </Button>
        </Group>
      )}
    </>
  );
}