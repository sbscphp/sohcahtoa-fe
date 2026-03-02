"use client";

import { Modal, Text, Stack, Button, Group } from "@mantine/core";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { CustomButton } from "@/app/admin/_components/CustomButton";

interface Transaction {
  id: string;
  date: string;
  time: string;
  amount: string;
  currency: string;
}

const mockTransactions: Transaction[] = [
  { id: "GHA67AGHA", date: "April 11, 2025", time: "04:00 PM", amount: "2000", currency: "₵" },
  { id: "GHA67AGHA", date: "April 11, 2025", time: "04:00 PM", amount: "2000", currency: "$" },
  { id: "GHA67AGHA", date: "April 11, 2025", time: "04:00 PM", amount: "2000", currency: "₦" },
  { id: "GHA68AGHB", date: "April 11, 2025", time: "05:30 PM", amount: "2500", currency: "$" },
  { id: "GHA69AGHC", date: "April 11, 2025", time: "06:15 PM", amount: "3000", currency: "$" },
];

interface TransactionHistoryModalProps {
  opened: boolean;
  onClose: () => void;
  customerId: string;
}

export function TransactionHistoryModal({
  opened,
  onClose,
  customerId,
}: TransactionHistoryModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title=""
      size="lg"
      centered
      radius="lg"
    >
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Text fw={600} size="xl" mb="xs">
            Transaction History
          </Text>
          <Text size="sm" c="dimmed">
            Track and manage customer's transaction history here.
          </Text>
        </div>

        {/* Transaction List */}
        <div className="max-h-[400px] overflow-y-auto space-y-4">
          {mockTransactions.map((transaction, index) => (
            <Group
              key={index}
              justify="space-between"
              className="py-3 border-b border-gray-100 last:border-0"
            >
              <Group gap="md">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <RotateCcw size={18} className="text-gray-600" />
                </div>
                <div>
                  <Text fw={500} size="sm">
                    {transaction.id}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {transaction.date} • {transaction.time}
                  </Text>
                </div>
              </Group>
              <Text fw={600} size="sm">
                {transaction.currency} {transaction.amount}
              </Text>
            </Group>
          ))}
        </div>

        {/* Footer Button */}
        <CustomButton
          buttonType="primary"
          fullWidth
          size="lg"
          radius="xl"
          rightSection={<ArrowUpRight size={16} />}
          onClick={() => {
            // Handle start new transaction
            console.log("Start new transaction");
            onClose();
          }}
        >
          Start New Transaction
        </CustomButton>
      </Stack>
    </Modal>
  );
}
