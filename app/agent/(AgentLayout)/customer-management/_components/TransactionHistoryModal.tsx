"use client";

import { useMemo } from "react";
import { Modal, Text, Stack, Group } from "@mantine/core";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import { agentApi } from "@/app/agent/_services/agent-api";
import type { AgentCustomerTransactionsResponse } from "@/app/_lib/api/types";
import {
  formatLocalDate,
  formatShortTime,
} from "@/app/utils/helper/formatLocalDate";
import Loader from "@/components/loader";

interface TransactionHistoryModalProps {
  opened: boolean;
  onClose: () => void;
  customerId: string;
}

export function TransactionHistoryModal({
  opened,
  onClose,
  customerId,
}: Readonly<TransactionHistoryModalProps>) {
  const { data, isLoading } = useFetchData<AgentCustomerTransactionsResponse>(
    customerId && opened
      ? [...agentKeys.customers.transactions(customerId, { page: 1, limit: 20 })]
      : [],
    () => agentApi.customers.transactions(customerId, { page: 1, limit: 20 }),
    !!customerId && opened
  );

  const transactions = useMemo(() => data?.data ?? [], [data]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={  <div>
        <Text fw={600} size="xl" mb="xs">
          Transaction History
        </Text>
        <Text size="sm" c="dimmed">
          Track and manage customer&apos;s transaction history here.
        </Text>
      </div>}
      size="lg"
      centered
      radius="lg"
    >
      <Stack gap="lg">
        {/* Transaction List */}
        <div className="max-h-[400px] overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader fullPage />
            </div>
          ) : null}
          {!isLoading && transactions.length === 0 ? (
            <Text size="sm" c="dimmed">
              No transactions found for this customer yet.
            </Text>
          ) : null}

          {transactions.map((transaction) => (
            <Group
              key={transaction.transactionId}
              justify="space-between"
              className="py-3 border-b border-gray-100 last:border-0"
            >
              <Group gap="md">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <RotateCcw size={18} className="text-gray-600" />
                </div>
                <div>
                  <Text fw={500} size="sm">
                    {transaction.transactionReferenceNumber}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {transaction.transactionType} •{" "}
                    {formatLocalDate(transaction.transactionDate, "d MMM yyyy")} •{" "}
                    {formatShortTime(transaction.transactionDate)}
                  </Text>
                </div>
              </Group>
              <Text fw={600} size="sm">
                {transaction.currency} {transaction.foreignAmount}
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
