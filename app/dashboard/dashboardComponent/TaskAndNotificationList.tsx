"use client";

import {
  Card,
  Group,
  Text,
  Stack,
  Badge,
} from "@mantine/core";
import { Notification } from "../../types/dashboard";
import { ChevronRight } from "lucide-react";

export function TaskAndNotificationList({
  data,
}: {
  data: Notification[];
}) {
  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" mb="sm">
        <Text fw={500}>Task List & Notification</Text>
        <Text size="sm" c="orange">
          View all →
        </Text>
      </Group>

      <Stack gap="md">
        {data.map((item) => (
          <Group
            key={item.id}
            justify="space-between"
            align="flex-start"
          >
            <div>
              <Group gap="xs">
                <Text size="sm" fw={500}>
                  {item.title}
                </Text>
                {item.unread && (
                  <Badge color="orange" size="xs">
                    Unread
                  </Badge>
                )}
              </Group>

              <Text size="xs" c="dimmed">
                {item.description}
              </Text>

              <Text size="xs" c="dimmed">
                {item.date} · {item.time}
              </Text>
            </div>

            <ChevronRight size={16} />
          </Group>
        ))}
      </Stack>
    </Card>
  );
}
