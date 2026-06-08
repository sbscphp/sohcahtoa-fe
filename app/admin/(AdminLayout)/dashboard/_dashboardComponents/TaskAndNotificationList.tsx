"use client";

import { Card, Group, Text, Stack, Skeleton } from "@mantine/core";
import { Notification } from "../../../_types/dashboard";
import { ArrowUpRight } from "lucide-react";
import ListItem from "./ListItem";
import EmptySection from "../../../_components/EmptySection";
import { adminRoutes } from "@/lib/adminRoutes";
import Link from "next/link";

export function TaskAndNotificationList({
  data,
  loading = false,
}: {
  data: Notification[];
  loading?: boolean;
}) {
  return (
    <Card withBorder radius="md" padding="md">
      <Group justify="space-between" mb="sm">
        <Text fw={500}>Pending Workflow</Text>
        <Link href={adminRoutes.adminTransactionsWorkflows()} className="flex items-center">
          <Text size="sm" c="orange">
            View all
          </Text>
          <ArrowUpRight size={14} color="orange" />
        </Link>
      </Group>

      {loading ? (
        <Stack gap="sm">
          <Skeleton height={72} radius="md" />
          <Skeleton height={72} radius="md" />
          <Skeleton height={72} radius="md" />
        </Stack>
      ) : data.length === 0 ? (
        <EmptySection
          format="secondary"
          title="No pending workflows yet."
          description="There are currently no pending workflows to display."
        />
      ) : (
        <Stack gap="md">
          {data.map((item) => (
            <ListItem
              key={item.id}
              title={item.title}
              description={item.description}
              date={item.date}
              time={item.time}
              badge={
                item.unread
                  ? { label: "Unread", color: "orange" }
                  : undefined
              }
              showIcons={true}
              cardStyle={true}
            />
          ))}
        </Stack>
      )}
    </Card>
  );
}
