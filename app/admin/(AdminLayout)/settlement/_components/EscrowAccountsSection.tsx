"use client";

import { Card, Text, Stack, Badge, Skeleton } from "@mantine/core";
import EmptySection from "@/app/admin/_components/EmptySection";
import { useSettlementEscrowAccounts } from "../hooks/useSettlementEscrowAccounts";

export function EscrowAccountsSection() {
  const { accounts, isLoading } = useSettlementEscrowAccounts();

  return (
    <Card padding="lg" radius="md" withBorder className="h-full bg-white">
      <Text fw={700} size="lg" mb="lg">Escrow Accounts</Text>

      {isLoading ? (
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} height={96} radius="md" />
          ))}
        </Stack>
      ) : accounts.length === 0 ? (
        <EmptySection
          format="secondary"
          title="No escrow accounts"
          description="There are currently no escrow accounts to display."
        />
      ) : (
        <Stack gap="md">
          {accounts.map((item) => (
            <div
              key={`${item.name}-${item.bank}-${item.number}`}
              className="flex justify-between items-start p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <Text size="sm" fw={700} c="dark" mb={4}>
                  {item.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {item.bank} - {item.number}
                </Text>
              </div>
              <Badge
                color={item.isActive ? "green" : "gray"}
                variant="light"
                size="xs"
                className={
                  item.isActive
                    ? "text-green-600 bg-green-50"
                    : "text-gray-600 bg-gray-100"
                }
              >
                {item.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </Stack>
      )}
    </Card>
  );
}
