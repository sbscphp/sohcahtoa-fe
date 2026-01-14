/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Card,
  Group,
  Text,
  Table,
  ActionIcon,
} from "@mantine/core";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Transaction } from "../../_types/dashboard";
import { StatusBadge } from "../../_components/reusable/StatusBadge";
import { ArrowUpRight, ChevronRight } from "lucide-react";

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: "Transaction ID",
  },
  {
    accessorKey: "date",
    header: "Transaction Date",
    cell: ({ row }) => (
      <div>
        <Text size="sm">{row.original.date}</Text>
        <Text size="xs" c="dimmed">
          {row.original.time}
        </Text>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={row.original.status} />
    ),
  },
  {
    id: "action",
    cell: () => (
      <ActionIcon variant="light" color="orange" radius="md">
        <ChevronRight size={16} />
      </ActionIcon>
    ),
  },
];

export function RecentTransactionsTable({
  data,
}: {
  data: Transaction[];
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" mb="sm">
        <Text fw={500}>Recent Transactions</Text>
        <div className="flex items-center">
        <Text size="sm" c="orange" >
          View all 
        </Text>
        <ArrowUpRight size={14} color="orange" />
        </div>
      </Group>

      <Table verticalSpacing="md" highlightOnHover>
        <thead className="text-sm font-normal">
          {table.getHeaderGroups().map((headerGroup: any) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header: any) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map((row: any) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell: any) => (
                <td key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
