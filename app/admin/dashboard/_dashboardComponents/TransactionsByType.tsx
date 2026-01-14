import { Card, Group, Text, Select, Stack } from "@mantine/core";
import { DonutChart } from "@mantine/charts";
import { HiCalendarDateRange } from "react-icons/hi2";

const data = [
  { name: "PTA", value: 3500000, color: "orange.7" },
  { name: "BTA", value: 2800000, color: "orange.5" },
  { name: "School fees", value: 1500000, color: "orange.3" },
  { name: "Tourism", value: 900000, color: "orange.9" },
  { name: "Expatriate", value: 800000, color: "orange.2" },
  { name: "Series 6", value: 500000, color: "gray.4" },
];
const colors: Record<string, string> = {
  PTA: "bg-orange-600",
  BTA: "bg-orange-400",
  "School fees": "bg-orange-300",
  Tourism: "bg-orange-700",
  Expatriate: "bg-orange-200",
  "Series 6": "bg-gray-400",
}
    


export function TransactionsByType() {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  const icon = <HiCalendarDateRange size={16} />
  

  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" mb="md">
        <Text fw={500}>Transactions by Type</Text>

        <Select
          size="xs"
          data={["Last 7 Days", "Last 30 Days"]}
          w={95}
          defaultValue="Last 7 Days"
          rightSection={icon}
          rightSectionPointerEvents="none"
          radius="lg"
        />
      </Group>

      <div className="grid grid-cols-[2fr_1fr]">
      <Group justify="center">
        <DonutChart
          data={data}
          size={260}
          thickness={28}
          withLabelsLine={false}
          chartLabel={`$${total.toLocaleString()}`}
        />
        <div className="relative -top-34 "> 
    <p className="text-xs">Total Amount</p>
     </div>
      </Group>

      <Stack gap={3} mt="md">
        {data.map((item) => (
          <Group key={item.name} gap="xs">
            <div className={`w-2 h-2 rounded-full ${colors[item.name]}`} />

            <Text size="sm">{item.name}</Text>
          </Group>
        ))}
      </Stack>
      </div>
    </Card>
  );
}
