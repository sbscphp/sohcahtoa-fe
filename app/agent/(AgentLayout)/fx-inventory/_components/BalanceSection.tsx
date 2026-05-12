"use client";

import { useState } from "react";
import { Card, Text, Group, Stack, Button, Badge } from "@mantine/core";
import { Info, ArrowDown, ArrowUp, RefreshCw } from "lucide-react";
import { CurrencySelectorWithSearch } from "@/app/agent/(AgentLayout)/rate-calculator/_components/CurrencySelectorWithSearch";
import { CURRENCIES, getCurrencyByCode, type Currency } from "@/app/(customer)/_lib/currency";
import { getCurrencySymbol } from "@/app/(customer)/_lib/currency";

interface BalanceSectionProps {
  totalFxUnits: string;
  currency?: Currency;
  onCurrencyChange?: (currency: Currency) => void;
  onBuyFx?: () => void;
  onSellFx?: () => void;
  onReceiveMoney?: () => void;
}

export function BalanceSection({
  totalFxUnits,
  currency = getCurrencyByCode("USD") ?? CURRENCIES[0],
  onCurrencyChange,
  onBuyFx,
  onSellFx,
  onReceiveMoney,
}: BalanceSectionProps) {
  const [activeFilter, setActiveFilter] = useState<"FX bought" | "FX sold" | "Others">("FX bought");

  return (
    <Card radius="md" padding="lg" withBorder>
      <Stack gap="lg">
        {/* Top Filters and Currency Selector */}
        <Group justify="space-between" align="flex-start">
          <Group gap="xs">
            <Badge
              variant={activeFilter === "FX bought" ? "filled" : "outline"}
              color={activeFilter === "FX bought" ? "orange" : "gray"}
              size="lg"
              radius="xl"
              className="cursor-pointer"
              onClick={() => setActiveFilter("FX bought")}
            >
              FX bought
            </Badge>
            <Badge
              variant={activeFilter === "FX sold" ? "filled" : "outline"}
              color={activeFilter === "FX sold" ? "orange" : "gray"}
              size="lg"
              radius="xl"
              className="cursor-pointer"
              onClick={() => setActiveFilter("FX sold")}
            >
              FX sold
            </Badge>
            <Badge
              variant={activeFilter === "Others" ? "filled" : "outline"}
              color={activeFilter === "Others" ? "orange" : "gray"}
              size="lg"
              radius="xl"
              className="cursor-pointer"
              onClick={() => setActiveFilter("Others")}
            >
              Others
            </Badge>
          </Group>

          {onCurrencyChange && (
            <CurrencySelectorWithSearch
              selectedCurrency={currency}
              onCurrencyChange={onCurrencyChange}
            />
          )}
        </Group>

        {/* Total FX Units Display */}
        <div>
          <Group gap="xs" mb="xs">
            <Text size="sm" fw={500} c="dimmed">
              Total FX units
            </Text>
            <Info size={16} className="text-gray-400" />
          </Group>
          <Text fw={700} size="2xl" className="text-body-heading-300">
            {getCurrencySymbol(currency.code)} {totalFxUnits}
          </Text>
        </div>

        {/* Action Buttons */}
        <Group gap="md" mt="md">
          <Button
            variant="light"
            color="orange"
            size="lg"
            className="flex-1"
            leftSection={<ArrowDown size={20} />}
            onClick={onBuyFx}
          >
            Buy FX
          </Button>
          <Button
            variant="light"
            color="orange"
            size="lg"
            className="flex-1"
            leftSection={<ArrowUp size={20} />}
            onClick={onSellFx}
          >
            Sell FX
          </Button>
          <Button
            variant="light"
            color="orange"
            size="lg"
            className="flex-1"
            leftSection={<RefreshCw size={20} />}
            onClick={onReceiveMoney}
          >
            Receive money
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
