"use client";

import { Card, Text, SimpleGrid } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";

interface SummaryCardsProps {
  cashReceivedFromCustomer: string;
  cashReceivedFromAdmin: string;
  cashDisbursed: string;
}

export function SummaryCards({
  cashReceivedFromCustomer,
  cashReceivedFromAdmin,
  cashDisbursed,
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
        <Card key={index} radius="md" padding="lg" withBorder>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Text size="sm" c="dimmed" mb="xs">
                {card.title}
              </Text>
              <Text fw={700} size="xl" className="text-body-heading-300">
                {card.value}
              </Text>
            </div>
            <ArrowUpRight size={20} className="text-gray-400" />
          </div>
        </Card>
      ))}
    </SimpleGrid>
  );
}
