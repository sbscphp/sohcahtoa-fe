"use client";

import {
  Card,
  Group,
  Text,
  Stack,
} from "@mantine/core";
import { Notification } from "../../../_types/dashboard";
import { ArrowUpRight } from "lucide-react";
import ListItem from "../../../_components/ListItem";

export function TaskAndNotificationList({
  data,
}: {
  data: Notification[];
}) {
  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" mb="sm">
        <Text fw={500}>Task List & Notification</Text>
        <div className="flex items-center">
          <Text size="sm" c="orange">
            View all
          </Text>
          <ArrowUpRight size={14} color="orange" />
        </div>
      </Group>

      <Stack gap="md">
        {data.map((item) => (
          <ListItem
            key={item.id}
            title={item.title}
            description={item.description}
            date={item.date}
            time={item.time}
            badge={item.unread ? { label: "Unread", color: "orange" } : undefined}
          />
        ))}
      </Stack>
    </Card>
  );
}
