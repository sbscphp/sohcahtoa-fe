"use client";

import { useEffect, useState } from "react";
import { Card, Group, Text, Stack, Skeleton } from "@mantine/core";
import { ArrowUpRight, Calendar, Clock, Timer } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EmptySection from "../../../_components/EmptySection";
import { adminRoutes } from "@/lib/adminRoutes";
import type { DashboardTaskRow } from "../mapDashboardData";
import { TransactionStatusBadge } from "@/app/admin/_components/TransactionStatusBadge";
import {
  formatEscalationCountdown,
  getElapsedMinutesSince,
} from "@/app/utils/helper/formatEscalationCountdown";

function EscalationCountdown({
  dateInitiatedAt,
  fallbackMinutes,
}: {
  dateInitiatedAt: string;
  fallbackMinutes: number;
}) {
  const [minutes, setMinutes] = useState(() =>
    getElapsedMinutesSince(dateInitiatedAt, fallbackMinutes)
  );

  useEffect(() => {
    const update = () =>
      setMinutes(getElapsedMinutesSince(dateInitiatedAt, fallbackMinutes));

    update();
    const intervalId = window.setInterval(update, 60_000);

    return () => window.clearInterval(intervalId);
  }, [dateInitiatedAt, fallbackMinutes]);

  const isUrgent = minutes <= 60;

  return (
    <Group gap={4} wrap="nowrap">
      <Timer
        size={11}
        className={isUrgent ? "text-orange-500" : "text-gray-400"}
      />
      <Text
        size="xs"
        fw={500}
        className={isUrgent ? "text-orange-500" : "text-gray-500"}
      >
        {formatEscalationCountdown(minutes)}
      </Text>
    </Group>
  );
}

export function TaskAndNotificationList({
  data,
  loading = false,
}: {
  data: DashboardTaskRow[];
  loading?: boolean;
}) {
  const router = useRouter();

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
        <Stack gap="sm">
          {data.map((item) => (
            <div
              key={item.id}
              className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              onClick={() => router.push(adminRoutes.adminTransactionDetails(item.id))}
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                {/* Left: module + workflow action + entity title */}
                <div className="min-w-0 flex-1 space-y-1">
                  <Group gap="xs" wrap="nowrap" align="center">
                    <Text size="xs" c="dimmed" className="shrink-0">
                      {item.module}
                    </Text>
                    <Text size="xs" c="dimmed">·</Text>
                    <Text size="xs" fw={500} className="truncate text-gray-700">
                      {item.workflowAction}
                    </Text>
                  </Group>

                  <Text size="sm" fw={500} className="truncate text-gray-900">
                    {item.entityTitle || item.title}
                  </Text>

                  <Group gap="xs" wrap="nowrap" mt={2}>
                    <Group gap={4} wrap="nowrap">
                      <Calendar size={11} className="text-gray-400 shrink-0" />
                      <Text size="xs" c="dimmed">{item.dateInitiated}</Text>
                    </Group>
                    <Group gap={4} wrap="nowrap">
                      <Clock size={11} className="text-gray-400 shrink-0" />
                      <Text size="xs" c="dimmed">{item.timeInitiated}</Text>
                    </Group>
                  </Group>
                </div>

                {/* Right: status + escalation */}
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <TransactionStatusBadge status={item.actionNeeded} size="xs" />
                  <EscalationCountdown
                    dateInitiatedAt={item.dateInitiatedAt}
                    fallbackMinutes={item.escalationMinutes}
                  />
                </div>
              </Group>
            </div>
          ))}
        </Stack>
      )}
    </Card>
  );
}
