"use client";

import { Card, Text, Group, Stack } from "@mantine/core";
import { Clock } from "lucide-react";
import { SectionHeader, PriorityBadge } from "./SettlementDashboardShared";
import { pendingReconData } from "./settlementDashboardMockData";

export function PendingReconciliationSection() {
  return (
    <Card padding="lg" radius="md" withBorder className="h-full bg-white">
      <SectionHeader title="Pending Reconciliation" />

      <Stack gap="md">
        {pendingReconData.map((item, idx) => (
          <div key={idx} className="p-4 transition-colors border border-gray-100 rounded-lg hover:border-gray-200">
            <Group justify="space-between" mb="xs">
              <div>
                <Text size="sm" fw={700} c="dark">{item.id}</Text>
                <Text size="xs" c="dimmed">{item.location}</Text>
              </div>
              <PriorityBadge level={item.priority} />
            </Group>
            <Group gap="xs">
              {item.isOverdue ? (
                <Clock size={14} className="text-red-500" />
              ) : (
                <Clock size={14} className="text-gray-400" />
              )}
              <Text size="xs" c={item.isOverdue ? "red.6" : "dimmed"} fw={item.isOverdue ? 600 : 400}>
                {item.time}
              </Text>
            </Group>
          </div>
        ))}
      </Stack>
    </Card>
  );
}
