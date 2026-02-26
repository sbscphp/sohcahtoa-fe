"use client";

import { Card, Text, Group, Badge, Stack } from "@mantine/core";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import DynamicTableSection from "@/app/admin/_components/DynamicTableSection";

interface SupportRequest {
  id: string;
  category: string;
  date: string;
  status: "Approved" | "Pending" | "Rejected";
}

const mockRequests: SupportRequest[] = [
  {
    id: "1",
    category: "Failed login/password reset not working.",
    date: "Oct 29, 2025 10:25am",
    status: "Approved",
  },
  {
    id: "2",
    category: "Customer unable to access account settings.",
    date: "Oct 29, 2025 10:25am",
    status: "Approved",
  },
  {
    id: "3",
    category: "2FA/OTP not delivered.",
    date: "Oct 29, 2025 10:25am",
    status: "Approved",
  },
  {
    id: "4",
    category: "BVN/TIN mismatch issue.",
    date: "Oct 29, 2025 10:25am",
    status: "Approved",
  },
  {
    id: "5",
    category: "Error uploading document (flight ticket, admission letter, Medical bill, etc.",
    date: "Oct 29, 2025 10:25am",
    status: "Approved",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Approved":
      return "green";
    case "Pending":
      return "orange";
    case "Rejected":
      return "red";
    default:
      return "gray";
  }
};

export default function SupportHistoryPage() {
  const router = useRouter();

  const headers = [
    { label: "Category", key: "category" },
    { label: "Status", key: "status" },
    { label: "View", key: "view" },
  ];

  const renderRequestRow = (item: SupportRequest) => [
    <div key="category">
      <Text fw={500} size="sm">
        {item.category}
      </Text>
      <Text size="xs" c="dimmed">
        {item.date}
      </Text>
    </div>,

    <Badge
      key="status"
      color={getStatusColor(item.status)}
      variant="light"
      size="sm"
    >
      {item.status}
    </Badge>,

    <button
      key="view"
      onClick={() => router.push(`/agent/support/history/${item.id}`)}
      className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center hover:bg-primary-200 transition-colors"
    >
      <ChevronRight size={16} className="text-primary-400" />
    </button>,
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Group gap="xs">
        <Text size="sm" c="dimmed">
          Support
        </Text>
        <Text size="sm" c="dimmed">
          /
        </Text>
        <Text size="sm" c="dimmed">
          Chat Support
        </Text>
        <Text size="sm" c="dimmed">
          /
        </Text>
        <Text size="sm" fw={500}>
          History
        </Text>
      </Group>

      {/* Header */}
      <div>
        <Text fw={600} size="xl" mb="xs">
          Support
        </Text>
        <Text size="sm" c="dimmed">
          View and track the status of your past support request.
        </Text>
      </div>

      {/* Requests Table */}
      <Card radius="md" padding="lg" withBorder>
        <DynamicTableSection
          headers={headers}
          data={mockRequests}
          loading={false}
          renderItems={renderRequestRow}
          emptyTitle="No Support Requests"
          emptyMessage="You haven't submitted any support requests yet."
        />
      </Card>
    </div>
  );
}
