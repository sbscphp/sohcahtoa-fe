"use client";

import { Table, Pagination } from "@mantine/core";
import { useState, ReactNode } from "react";

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
  onRowClick?: (item: T) => void;
  keyExtractor?: (item: T, index: number) => string | number;
  emptyMessage?: string;
}

export default function PaginatedTable<T>({
  data,
  columns,
  pageSize = 10,
  onRowClick,
  keyExtractor,
  emptyMessage = "No data found",
}: PaginatedTableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  const getKey = (item: T, index: number) => {
    if (keyExtractor) {
      return keyExtractor(item, index);
    }
    return index;
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border-[1.5px] border-gray-100 rounded-xl">
        <Table
          verticalSpacing={0}
          horizontalSpacing={0}
          highlightOnHover={false}
          className="w-full"
          style={{ borderCollapse: "separate", borderSpacing: 0 }}
          withTableBorder={false}
          withColumnBorders={false}
        >
          <Table.Thead>
            <Table.Tr className="bg-[#F9F9F9]!">
              {columns.map((column) => (
                <Table.Th
                  key={column.key}
                  className={`py-3! px-6! h-11! border-0! ${column.headerClassName || ""}`}
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
            {paginatedData.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length} className="text-center py-8 border-0">
                  <p className="text-body-text-300 text-sm">{emptyMessage}</p>
                </Table.Td>
              </Table.Tr>
            ) : (
              paginatedData.map((item, index) => (
                <Table.Tr
                  key={getKey(item, index)}
                  className={`border-b border-gray-100! hover:bg-[#FFF6F1]! ${onRowClick ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <Table.Td
                      key={column.key}
                      className={`py-4 px-6! h-18! border-0! ${column.className || ""}`}
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
                        : String((item as Record<string, unknown>)[column.key] ?? "")}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            value={page}
            onChange={setPage}
            total={totalPages}
            size="sm"
            radius="md"
          />
        </div>
      )}
    </div>
  );
}
