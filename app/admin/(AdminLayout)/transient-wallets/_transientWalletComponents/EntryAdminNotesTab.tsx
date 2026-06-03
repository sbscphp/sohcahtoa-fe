"use client";

import { useState } from "react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";
import { Text } from "@mantine/core";
import { useTransientEntryAdminNotes } from "../hooks/useTransientWalletEntryDetails";

const noteHeaders = [
  { label: "Date & Time", key: "dateTime" },
  { label: "Note", key: "note" },
  { label: "Author", key: "author" },
];

interface EntryAdminNotesTabProps {
  entryId: string;
}

export default function EntryAdminNotesTab({ entryId }: EntryAdminNotesTabProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { notes, isLoading, isFetching, totalPages } =
    useTransientEntryAdminNotes(entryId, page, pageSize);

  const safeTotalPages = Math.max(1, totalPages);

  const renderRow = (item: (typeof notes)[number]) => [
    <div key="dateTime">
      <Text size="sm">{item.date}</Text>
      <Text size="xs" c="dimmed">
        {item.time}
      </Text>
    </div>,
    <Text key="note" size="sm" className="max-w-md">
      {item.note}
    </Text>,
    <Text key="author" size="sm">
      {item.author}
    </Text>,
  ];

  return (
    <DynamicTableSection
      headers={noteHeaders}
      data={notes}
      loading={isLoading || isFetching}
      renderItems={renderRow}
      emptyTitle="No Admin Notes Found"
      emptyMessage="No notes have been added to this entry yet."
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
