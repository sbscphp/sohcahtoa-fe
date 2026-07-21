"use client";

import { Card, Text, SimpleGrid, Skeleton } from "@mantine/core";

export interface FxInventorySummaryCardValues {
  cashReceivedFromCustomer: string;
  cashReceivedFromAdmin: string;
  cashDisbursedToAgent: string;
  cashDisbursed: string;
}

interface SummaryCardsProps extends FxInventorySummaryCardValues {
  isLoading?: boolean;
}

const CARD_CONFIG: ReadonlyArray<{
  key: keyof FxInventorySummaryCardValues;
  title: string;
}> = [
  {
    key: "cashReceivedFromCustomer",
    title: "Cash received from customer",
  },
  {
    key: "cashReceivedFromAdmin",
    title: "Cash received from admin",
  },
  {
    key: "cashDisbursedToAgent",
    title: "Cash disbursed to agent",
  },
  {
    key: "cashDisbursed",
    title: "Cash disbursed",
  },
];

export function SummaryCards({
  cashReceivedFromCustomer,
  cashReceivedFromAdmin,
  cashDisbursedToAgent,
  cashDisbursed,
  isLoading = false,
}: Readonly<SummaryCardsProps>) {
  const values: FxInventorySummaryCardValues = {
    cashReceivedFromCustomer,
    cashReceivedFromAdmin,
    cashDisbursedToAgent,
    cashDisbursed,
  };

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
      {CARD_CONFIG.map((card) => (
        <Card key={card.key} radius="lg" padding="lg" withBorder>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Text size="sm" c="dimmed" mb="xs">
                {card.title}
              </Text>
              {isLoading ? (
                <Skeleton height={28} mt={4} radius="sm" />
              ) : (
                <Text fw={700} size="xl" className="text-body-heading-300">
                  {values[card.key]}
                </Text>
              )}
            </div>
          </div>
        </Card>
      ))}
    </SimpleGrid>
  );
}
