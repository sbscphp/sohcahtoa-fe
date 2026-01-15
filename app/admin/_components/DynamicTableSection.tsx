import {
  Table,
  Text,
} from "@mantine/core";
import React from "react";
import EmptySection from "./EmptySection";
import LoadingState from "./LoadingState";

interface Header {
  label: string;
  key: string;
}

interface DynamicTableSectionProps<T> {
  headers: Header[];
  data: T[];
  loading?: boolean;
  /**
   * Single render function used for both table rows and cards.
   * Receives each item and header list (so you can map fields easily).
   */
  renderItems: (item: T, headers: Header[]) => React.ReactNode[];
  emptyMessage?: string;
  emptyTitle?: string;
}

export default function DynamicTableSection<T>({
  headers,
  data,
  loading = false,
  renderItems,
  emptyMessage = "No records found",
  emptyTitle = "No Records Found",
}: DynamicTableSectionProps<T>) {
  const renderRowContent = (item: T) => {
    const content = renderItems(item, headers);
    return content.map((value, index) => (
      <Table.Td key={headers[index]?.key || index}>{value}</Table.Td>
    ));
  };

  return (
    <>
      {/* Loading */}
      {loading && (
        <LoadingState />
      )}

      {/* Table for larger screens */}
      {!loading && data?.length > 0 && (
        <div className="hidden! sm:block!">
          <div className="w-full overflow-x-auto">
            <Table
              verticalSpacing="sm"
              horizontalSpacing="md"
              highlightOnHover
              withTableBorder
              className="min-w-[800px]"
            >
              <Table.Thead>
                <Table.Tr>
                  {headers.map((header) => (
                    <Table.Th
                      key={header.key || header.label}
                      className="text-sm! font-semibold text-[#7C8496]! whitespace-nowrap bg-[#F8F9FB]"
                    >
                      {header.label}
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.map((item, i) => (
                  <Table.Tr key={i}>{renderRowContent(item)}</Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
        </div>
      )}

      {/* Card view for small screens */}
      {!loading && data?.length > 0 && (
        <div className="sm:hidden! space-y-4 p-4">
          {data.map((item, i) => {
            const content = renderItems(item, headers);
            return (
              <div
                key={i}
                className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white space-y-2"
              >
                {headers.map((header, index) => (
                  <div key={index}>
                    <Text fw={600} size="sm" c="dimmed">
                      {header.label}
                    </Text>
                    <div className="text-sm text-muted">{content[index]}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !data?.length && (
        <EmptySection title={emptyTitle} format="secondary" description={emptyMessage} />
      )}
    </>
  );
}
