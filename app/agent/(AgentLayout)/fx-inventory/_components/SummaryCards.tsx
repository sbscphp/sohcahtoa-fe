"use client";

import { Card, Text, SimpleGrid, Skeleton } from "@mantine/core";

interface SummaryCardsProps {
  cashReceivedFromCustomer: string;
  cashReceivedFromAdmin: string;
  cashDisbursed: string;
  isLoading?: boolean;
}

export function SummaryCards({
  cashReceivedFromCustomer,
  cashReceivedFromAdmin,
  cashDisbursed,
  isLoading = false,
}: SummaryCardsProps) {
  const cards = [
    {
      title: "Cash received from customer",
      value: cashReceivedFromCustomer,
    },
    {
      title: "Cash received from admin",
      value: cashReceivedFromAdmin,
    },
    {
      title: "Cash disbursed",
      value: cashDisbursed,
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
      {cards.map((card, index) => (
        <Card key={index} radius="lg" padding="lg" withBorder>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Text size="sm" c="dimmed" mb="xs">
                {card.title}
              </Text>
              {isLoading ? (
                <Skeleton height={28} mt={4} radius="sm" />
              ) : (
                <Text fw={700} size="xl" className="text-body-heading-300">
                  {card.value}
                </Text>
              )}
            </div>
          </div>
        </Card>
      ))}
    </SimpleGrid>
  );
}
