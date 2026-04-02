"use client";

import { useState } from "react";
import { Card, Text, Group, Stack, Skeleton } from "@mantine/core";
import { Clock } from "lucide-react";
import { PriorityBadge } from "./SettlementDashboardShared";
import TablePaginator from "@/app/admin/_components/TablePaginator";
import EmptySection from "@/app/admin/_components/EmptySection";
import { useSettlementPendingReconciliations } from "../hooks/useSettlementPendingReconciliations";

const PAGE_SIZE = 10;

export function PendingReconciliationSection() {
  const [page, setPage] = useState(1);

  const { pendingReconciliations, total, totalPages, isLoading } =
    useSettlementPendingReconciliations({ page, limit: PAGE_SIZE });

  const safeTotalPages = Math.max(totalPages, 1);

  return (
    <Card padding="lg" radius="md" withBorder className="h-full bg-white">
      <Text fw={700} size="lg" mb="lg">Pending Reconciliation</Text>

      {isLoading ? (
        <Stack gap="md">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} height={96} radius="md" />
          ))}
        </Stack>
      ) : pendingReconciliations.length === 0 ? (
        <EmptySection
          format="secondary"
          title="No pending reconciliations"
          description="There are currently no pending reconciliation reports to display."
        />
      ) : (
        <>
          <Stack gap="md">
            {pendingReconciliations.map((item) => (
              <div
                key={item.id}
                className="p-4 transition-colors border border-gray-100 rounded-lg hover:border-gray-200"
              >
                <Group justify="space-between" mb="xs">
                  <div>
                    <Text size="sm" fw={700} c="dark">
                      {item.id}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {item.location}
                    </Text>
                  </div>
                  <PriorityBadge level={item.priority} />
                </Group>
                <Group gap="xs">
                  {item.isOverdue ? (
                    <Clock size={14} className="text-red-500" />
                  ) : (
                    <Clock size={14} className="text-gray-400" />
                  )}
                  <Text
                    size="xs"
                    c={item.isOverdue ? "red.6" : "dimmed"}
                    fw={item.isOverdue ? 600 : 400}
                  >
                    {item.time}
                  </Text>
                </Group>
              </div>
            ))}
          </Stack>

          {total > 0 ? (
            <TablePaginator
              page={page}
              totalPages={safeTotalPages}
              mode="mobile"
              onPrevious={() => setPage((p) => Math.max(p - 1, 1))}
              onNext={() =>
                setPage((p) => Math.min(p + 1, safeTotalPages))
              }
              onPageChange={(p) => setPage(p)}
            />
          ) : null}
        </>
      )}
    </Card>
  );
}
