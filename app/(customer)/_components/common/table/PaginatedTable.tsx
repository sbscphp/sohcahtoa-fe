"use client";

import { Table, Pagination, Skeleton } from "@mantine/core";
import { useState, ReactNode } from "react";
import { EmptyState } from "../EmptyState";

export interface PaginatedTableColumn<T> {
  key: string;
  label: string;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  /** Alignment for header and body so they stay inline (overrides Mantine default). */
  align?: "left" | "center" | "right";
}

interface PaginatedTableProps<T> {
  data: T[];
  columns: PaginatedTableColumn<T>[];
  pageSize?: number;
  /** Controlled pagination (server-side). When provided, component won't slice data. */
  page?: number;
  onPageChange?: (page: number) => void;
  totalPages?: number;
  onRowClick?: (item: T) => void;
  keyExtractor?: (item: T, index: number) => string | number;
  /** Title for the empty state */
  emptyTitle?: string;
  /** Shown when data is empty and not loading. */
  emptyMessage?: string;
  /** When true, shows skeleton rows instead of data. */
  isLoading?: boolean;
  /** Number of skeleton rows to show when loading. Default 4. */
  skeletonRowCount?: number;
}

export default function PaginatedTable<T>({
  data,
  columns,
  pageSize = 10,
  page: controlledPage,
  onPageChange,
  totalPages: controlledTotalPages,
  onRowClick,
  keyExtractor,
  emptyTitle = "No Data available",
  emptyMessage = "No data found",
  isLoading = false,
  skeletonRowCount = 4,
}: Readonly<PaginatedTableProps<T>>) {
  const [page, setPage] = useState(1);
  const [skeletonKeys] = useState(() =>
    Array.from({ length: skeletonRowCount }, () => {
      const uuid =
        typeof globalThis.crypto?.randomUUID === "function"
          ? globalThis.crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      return `skeleton-${uuid}`;
    })
  );
  const isControlled = typeof controlledPage === "number" && typeof onPageChange === "function";
  const currentPage = isControlled ? controlledPage : page;
  const totalPages = controlledTotalPages ?? Math.ceil(data.length / pageSize);
  const paginatedData = isControlled
    ? data
    : data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getKey = (item: T, index: number) => {
    if (keyExtractor) {
      return keyExtractor(item, index);
    }
    return index;
  };

  const showEmpty = !isLoading && paginatedData.length === 0;
  const showSkeleton = isLoading;
  const showData = !isLoading && paginatedData.length > 0;

  return (
    <div className="space-y-4">
      <div className="min-w-0 overflow-x-auto rounded-xl border-[1.5px] border-gray-100">
        <Table
          verticalSpacing={0}
          horizontalSpacing={0}
          highlightOnHover={false}
          className="w-full min-w-[680px] table-auto"
          style={{ borderCollapse: "separate", borderSpacing: 0 }}
          withTableBorder={false}
          withColumnBorders={false}
        >
          <Table.Thead>
            <Table.Tr className="bg-[#F9F9F9]!">
              {columns.map((column) => (
                <Table.Th
                  key={column.key}
                  className={`h-11! border-0! py-3! pl-3! pr-3! sm:pl-6! sm:pr-6! ${column.headerClassName || ""}`}
                  style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: "#4D4B4B",
                    textAlign: column.align ?? "left",
                  }}
                >
                  {column.label}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {showSkeleton &&
              skeletonKeys.map((rowKey, rowIndex) => (
                <Table.Tr key={rowKey} className="border-b border-gray-100!">
                  {columns.map((column) => (
                    <Table.Td
                      key={`${column.key}-${rowIndex}`}
                      className="h-18! border-0! py-4 pl-3! pr-3! sm:pl-6! sm:pr-6!"
                      style={{ textAlign: column.align ?? "left" }}
                    >
                      <Skeleton height={20} radius="sm" />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            {showEmpty && (
              <Table.Tr>
                <Table.Td colSpan={columns.length} className="text-center py-8 border-0">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyMessage}
                    className="py-2"
                  />
                </Table.Td>
              </Table.Tr>
            )}
            {showData &&
              paginatedData.map((item, index) => (
                <Table.Tr
                  key={getKey(item, index)}
                  className={`border-b border-gray-100! hover:bg-[#FFF6F1]! ${onRowClick ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <Table.Td
                      key={column.key}
                      className={`h-18! border-0! py-4 pl-3! pr-3! sm:pl-6! sm:pr-6! ${column.className || ""}`}
                      style={{
                        fontWeight: 500,
                        fontSize: "14px",
                        lineHeight: "20px",
                        color: "#4D4B4B",
                        textAlign: column.align ?? "left",
                      }}
                    >
                      {column.render
                        ? column.render(item, index)
                        : (() => {
                            const v = (item as Record<string, unknown>)[column.key];
                            if (v == null) return "";
                            if (typeof v === "string") return v;
                            if (typeof v === "number" || typeof v === "boolean") return String(v);
                            return "";
                          })()}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            value={currentPage}
            onChange={(next) => {
              if (isControlled) onPageChange(next);
              else setPage(next);
            }}
            total={totalPages}
            size="sm"
            radius="md"
          />
        </div>
      )}
    </div>
  );
}
