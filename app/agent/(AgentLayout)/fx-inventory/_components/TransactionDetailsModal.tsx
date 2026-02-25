"use client";

import { Modal, Text, Stack, Group, Button, Divider } from "@mantine/core";
import { X } from "lucide-react";

interface TransactionDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  transaction: {
    cashReceivedFrom?: string;
    nameOfAdmin?: string;
    transactionDate: string;
    transactionId: string;
  };
}

export function TransactionDetailsModal({
  opened,
  onClose,
  transaction,
}: TransactionDetailsModalProps) {
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
            Details of cash received
          </Text>
        </div>
      }
      size="md"
      radius="md"
      closeButtonProps={{
        icon: <X size={16} />,
      }}
    >
      <Stack gap="md" mt="md">
        {transaction.cashReceivedFrom && (
          <>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Cash received from Customer:
              </Text>
              <Text fw={500} size="sm">
                {transaction.cashReceivedFrom}
              </Text>
            </Group>
            <Divider />
          </>
        )}

        {transaction.nameOfAdmin && (
          <>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Name of Admin
              </Text>
              <Text fw={500} size="sm">
                {transaction.nameOfAdmin}
              </Text>
            </Group>
            <Divider />
          </>
        )}

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Transaction date
          </Text>
          <Text fw={500} size="sm">
            {transaction.transactionDate}
          </Text>
        </Group>
        <Divider />

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Transaction ID:
          </Text>
          <Text
            fw={500}
            size="sm"
            c="orange"
            className="underline cursor-pointer hover:opacity-80"
          >
            {transaction.transactionId}
          </Text>
        </Group>

        <Group justify="flex-end" mt="xl">
          <Button variant="outline" color="orange" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
