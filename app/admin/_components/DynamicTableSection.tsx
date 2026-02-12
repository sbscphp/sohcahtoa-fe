"use client";

import React from "react";
import {
  Table,
  Text,
  Group,
  Button,
  ActionIcon,
} from "@mantine/core";
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
}: DynamicTableSectionProps<T>) {
  const renderRowContent = (item: T) => {
    const content = renderItems(item, headers);
    return content.map((value, index) => (
      <Table.Td key={headers[index]?.key ?? index}>
        {value}
      </Table.Td>
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
                <Table.Tr key={index}>
                  {renderRowContent(item)}
                </Table.Tr>
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
                  <div className="text-sm">
                    {content[index]}
                  </div>
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
            {Array.from({ length: pagination.totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              const isActive = pageNumber === pagination.page;

              return (
                <ActionIcon
                  key={pageNumber}
                  radius="md"
                  size="lg"
                  variant={isActive ? "filled" : "subtle"}
                  color={isActive ? "#F8DCCD" : "gray"}
                  c={isActive ? "#DD4F05" : "#667085"}
                  onClick={() =>
                    pagination.onPageChange?.(pageNumber)
                  }
                >
                  {pageNumber}
                </ActionIcon>
              );
            })}
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
