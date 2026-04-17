"use client";

import { Modal, Text, Stack, Group, Button, Divider } from "@mantine/core";
import { X } from "lucide-react";
import type { AgentPaymentMovementType } from "@/app/_lib/api/types";

interface TransactionDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  movementType: AgentPaymentMovementType;
  transactionId: string;
  customerOrAdminName: string;
  amountLabel: string;
  amountFormatted: string;
  transactionDate: string;
  currencyPair?: string;
  transactionTypeLabel?: string;
  onViewFullTransaction: () => void;
}

export function TransactionDetailsModal({
  opened,
  onClose,
  movementType,
  transactionId,
  customerOrAdminName,
  amountLabel,
  amountFormatted,
  transactionDate,
  currencyPair,
  transactionTypeLabel,
  onViewFullTransaction,
}: TransactionDetailsModalProps) {
  const nameLabel =
    movementType === "cash_received_from_admin" ? "Admin / source" : "Customer";

  return (
    <Modal
      centered
      opened={opened}
      onClose={onClose}
      title={
        <div>
          <Text fw={600} size="lg">
            Transaction details
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Cash movement summary
          </Text>
        </div>
      }
      size="md"
      radius="lg"
      closeButtonProps={{
        icon: <X size={16} />,
      }}
    >
      <Stack gap="md" mt="md">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {nameLabel}
          </Text>
          <Text fw={500} size="sm">
            {customerOrAdminName}
          </Text>
        </Group>
        <Divider />

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {amountLabel}
          </Text>
          <Text fw={500} size="sm">
            {amountFormatted}
          </Text>
        </Group>
        <Divider />

        {currencyPair ? (
          <>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Currency pair
              </Text>
              <Text fw={500} size="sm">
                {currencyPair}
              </Text>
            </Group>
            <Divider />
          </>
        ) : null}

        {transactionTypeLabel && transactionTypeLabel !== "—" ? (
          <>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Transaction type
              </Text>
              <Text fw={500} size="sm">
                {transactionTypeLabel}
              </Text>
            </Group>
            <Divider />
          </>
        ) : null}

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Transaction date
          </Text>
          <Text fw={500} size="sm">
            {transactionDate}
          </Text>
        </Group>
        <Divider />

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Transaction ID
          </Text>
          <Text
            fw={500}
            size="sm"
            c="orange"
            className="underline cursor-pointer hover:opacity-80"
            onClick={onViewFullTransaction}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onViewFullTransaction();
            }}
          >
            {transactionId}
          </Text>
        </Group>

        <Group justify="flex-end" mt="xl" gap="sm">
          <Button variant="outline" color="orange" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-primary-400 hover:bg-primary-500" onClick={onViewFullTransaction}>
            View full transaction
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
