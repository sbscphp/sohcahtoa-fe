"use client";

import React from "react";
import { Table, Text } from "@mantine/core";
import EmptySection from "./EmptySection";
import LoadingState from "./LoadingState";
import TablePaginator, { TablePaginatorProps } from "./TablePaginator";

/* --------------------------------------------
 Types
--------------------------------------------- */
export interface Header {
  label: string;
  key: string;
}

interface DynamicTableSectionProps<T> {
  headers: Header[];
  data: T[];
  loading?: boolean;
  renderItems: (item: T, headers: Header[]) => React.ReactNode[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  emptyTitle?: string;
  pagination?: TablePaginatorProps;
  isNoBorder?: boolean;
  /**
   * Fixed height for the table/card region, e.g. 480 or "60vh".
   * When set, the body scrolls internally and the header stays pinned.
   * Omit for the previous natural-height behavior.
   */
  height?: number | string;
}

/* --------------------------------------------
 Component
--------------------------------------------- */
export default function DynamicTableSection<T>({
  headers,
  data,
  loading = false,
  renderItems,
  onRowClick,
  emptyMessage = "No records found",
  emptyTitle = "No Records Found",
  pagination,
  isNoBorder = false,
  height,
}: DynamicTableSectionProps<T>) {
  const fixedHeightStyle: React.CSSProperties | undefined = height
    ? { height }
    : undefined;

  if (loading) {
    return (
      <div style={fixedHeightStyle}>
        <LoadingState cols={headers.length} />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div
        style={fixedHeightStyle}
        className={height ? "flex items-center justify-center" : undefined}
      >
        <EmptySection
          title={emptyTitle}
          format="secondary"
          description={emptyMessage}
        />
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div
        className="hidden sm:block w-full overflow-x-auto"
        style={height ? { ...fixedHeightStyle, overflowY: "auto" } : undefined}
      >
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
                  className={`text-xs font-semibold text-[#7C8496] whitespace-nowrap bg-[#F8F9FB]${
                    height ? " sticky top-0 z-10" : ""
                  }`}
                >
                  {header.label}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {data.map((item, index) => {
              const cells = renderItems(item, headers);
              return (
                <Table.Tr
                  key={index}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  className={onRowClick ? "cursor-pointer" : undefined}
                >
                  {cells.map((cell, ci) => (
                    <Table.Td key={headers[ci]?.key ?? ci}>{cell}</Table.Td>
                  ))}
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div
        className="sm:hidden space-y-4 p-4"
        style={height ? { ...fixedHeightStyle, overflowY: "auto" } : undefined}
      >
        {data.map((item, i) => {
          const cells = renderItems(item, headers);
          return (
            <div
              key={i}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              className={`border border-gray-200 rounded-lg p-4 shadow-sm bg-white space-y-3${onRowClick ? " cursor-pointer" : ""}`}
            >
              {headers.map((header, ci) => (
                <div key={header.key}>
                  <Text fw={600} size="sm" c="dimmed">{header.label}</Text>
                  <div className="text-sm">{cells[ci]}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Pagination — stays outside the scroll area so it never scrolls with content */}
      {pagination && <TablePaginator {...pagination} />}
    </>
  );
}