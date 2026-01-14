"use client";

import {
  Card,
  Group,
  Text,
  Table,
  ActionIcon,
} from "@mantine/core";
import { Transaction } from "../../../_types/dashboard";
import { StatusBadge } from "../../../_components/StatusBadge";
import { ArrowUpRight, ChevronRight } from "lucide-react";

export function RecentTransactionsTable({
  data,
}: {
  data: Transaction[];
}) {
  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" mb="md">
        <Text fw={500} size="lg">Recent Transactions</Text>
        <div className="flex items-center gap-1 cursor-pointer">
          <Text size="sm" c="orange">
            View all
          </Text>
          <ArrowUpRight size={14} color="orange" />
        </div>
      </Group>

      <Table verticalSpacing="md" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <Text size="sm" fw={500} c="dimmed">
                Transaction ID
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={500} c="dimmed">
                Transaction Date
              </Text>
            </Table.Th>
            <Table.Th>
              <Text size="sm" fw={500} c="dimmed">
                Status
              </Text>
            </Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {data.map((transaction, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <Text size="sm" fw={500}>
                  {transaction.id}
                </Text>
              </Table.Td>
              <Table.Td>
                <div>
                  <Text size="sm" fw={500}>
                    {transaction.date}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {transaction.time}
                  </Text>
                </div>
              </Table.Td>
              <Table.Td>
                <StatusBadge status={transaction.status} />
              </Table.Td>
              <Table.Td>
                <ActionIcon 
                  variant="light" 
                  color="orange" 
                  radius="xl" 
                  size="md"
                >
                  <ChevronRight size={16} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
}
