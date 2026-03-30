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
  emptyMessage?: string;
  emptyTitle?: string;
  pagination?: TablePaginatorProps;
  isNoBorder?: boolean;
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
  if (loading) return <LoadingState cols={headers.length} />;

  if (!data?.length) {
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
      {/* Desktop Table */}
      <div className="hidden sm:block w-full overflow-x-auto">
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
            {data.map((item, index) => {
              const cells = renderItems(item, headers);
              return (
                <Table.Tr key={index}>
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
      <div className="sm:hidden space-y-4 p-4">
        {data.map((item, i) => {
          const cells = renderItems(item, headers);
          return (
            <div key={i} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white space-y-3">
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

      {/* Pagination */}
      {pagination && <TablePaginator {...pagination} />}
    </>
  );
}