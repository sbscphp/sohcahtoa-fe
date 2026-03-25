"use client";

import { Card, Text, Stack, Badge } from "@mantine/core";
import { escrowData } from "./settlementDashboardMockData";

export function EscrowAccountsSection() {
  return (
    <Card padding="lg" radius="md" withBorder className="h-full bg-white">
      <Text fw={700} size="lg" mb="lg">Escrow Accounts</Text>

      <Stack gap="md">
        {escrowData.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start p-4 border border-gray-200 rounded-lg">
            <div>
              <Text size="sm" fw={700} c="dark" mb={4}>{item.name}</Text>
              <Text size="xs" c="dimmed">{item.bank} - {item.number}</Text>
            </div>
            <Badge color="green" variant="light" size="xs" className="text-green-600 bg-green-50">Active</Badge>
          </div>
        ))}
      </Stack>
    </Card>
  );
}
