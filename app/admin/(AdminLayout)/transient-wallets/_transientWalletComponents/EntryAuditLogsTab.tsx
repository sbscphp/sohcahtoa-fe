"use client";

import { useState } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { Text } from "@mantine/core";
import { useTransientEntryAuditLogs } from "../hooks/useTransientWalletEntryDetails";

const auditHeaders = [
  { label: "Date & Time", key: "dateTime" },
  { label: "Action", key: "action" },
  { label: "Initiator/Source", key: "initiator" },
];

interface EntryAuditLogsTabProps {
  walletId: string;
  entryId: string;
}

export default function EntryAuditLogsTab({ walletId, entryId }: EntryAuditLogsTabProps) {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { logs, isLoading, isFetching, totalPages } =
    useTransientEntryAuditLogs(walletId, entryId, page, pageSize);

  const safeTotalPages = Math.max(1, totalPages);

  const renderRow = (item: (typeof logs)[number]) => [
    <div key="dateTime">
      <Text size="sm">{item.date}</Text>
      <Text size="xs" c="dimmed">
        {item.time}
      </Text>
    </div>,
    <Text key="action" size="sm">
      {item.action}
    </Text>,
    <Text key="initiator" size="sm">
      {item.initiator}
    </Text>,
  ];

  return (
    <DynamicTableSection
      headers={auditHeaders}
      data={logs}
      loading={isLoading || isFetching}
      renderItems={renderRow}
      emptyTitle="No Audit Logs Found"
      emptyMessage="No audit activity has been recorded for this entry yet."
      pagination={{
        page,
        totalPages: safeTotalPages,
        onNext: () => setPage((p) => Math.min(p + 1, safeTotalPages)),
        onPrevious: () => setPage((p) => Math.max(p - 1, 1)),
        onPageChange: setPage,
      }}
    />
  );
}
