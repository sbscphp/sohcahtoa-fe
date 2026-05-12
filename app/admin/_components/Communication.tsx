"use client";

import { useMemo } from "react";
import {
  Card,
  Group,
  Text,
  Avatar,
  Skeleton,
  Divider,
} from "@mantine/core";
import { MessageSquareOff } from "lucide-react";
import EmptyState from "./EmptyState";
import { useFetchData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type TicketCommentItem,
} from "@/app/admin/_services/admin-api";
import { type ApiResponse } from "@/app/_lib/api/client";

interface CommunicationProps {
  entityId?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

function getInitials(name: string): string {
  return name
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatCommentDate(value: string): string {
  if (!value) {
    return "--";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function normalizeComments(data: unknown): TicketCommentItem[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    )
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : "",
      message: typeof item.message === "string" ? item.message : "",
      createdAt: typeof item.createdAt === "string" ? item.createdAt : "",
      admin:
        typeof item.admin === "object" && item.admin !== null
          ? {
              id:
                typeof (item.admin as Record<string, unknown>).id === "string"
                  ? ((item.admin as Record<string, unknown>).id as string)
                  : "",
              fullName:
                typeof (item.admin as Record<string, unknown>).fullName ===
                "string"
                  ? ((item.admin as Record<string, unknown>).fullName as string)
                  : "Admin",
            }
          : null,
    }))
    .filter((item) => item.id && item.message.trim())
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export default function Communication({
  entityId,
  emptyTitle = "No Communication Yet",
  emptyDescription = "No comment has been added for this ticket yet.",
}: CommunicationProps) {
  const hasEntityId = Boolean(entityId);

  const commentsQuery = useFetchData<ApiResponse<TicketCommentItem[]>>(
    [...adminKeys.tickets.comments(entityId ?? "")],
    () =>
      adminApi.tickets.getComments(entityId ?? "") as unknown as Promise<
        ApiResponse<TicketCommentItem[]>
      >,
    hasEntityId
  );

  const comments = useMemo(
    () => normalizeComments(commentsQuery.data?.data),
    [commentsQuery.data?.data]
  );

  const emptyIcon = (
    <div className="relative flex items-center justify-center w-24 h-24 text-gray-300">
      <MessageSquareOff size={48} strokeWidth={1.5} className="absolute" />
    </div>
  );

  return (
    <Card radius="lg" p="xl" className="bg-white shadow-sm mt-6">
      <Group justify="space-between" align="center" mb="md">
        <Text fw={600} size="lg" className="text-gray-900">
          Communication
        </Text>
      </Group>
      <Divider my="md" />

      {commentsQuery.isLoading && (
        <div className="space-y-4 py-2">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex gap-3 items-start">
              <Skeleton height={36} width={36} radius="xl" />
              <div className="flex-1 space-y-2">
                <Skeleton height={12} width="30%" />
                <Skeleton height={10} width="20%" />
                <Skeleton height={14} width="80%" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!commentsQuery.isLoading && commentsQuery.isError && (
        <Text size="sm" c="red" py="md">
          Unable to load communication comments. Please refresh and try again.
        </Text>
      )}

      {!commentsQuery.isLoading && !commentsQuery.isError && comments.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} icon={emptyIcon} />
      )}

      {!commentsQuery.isLoading && !commentsQuery.isError && comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((comment) => {
            const authorName = comment.admin?.fullName?.trim() || "Admin";

            return (
              <div key={comment.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <Group align="flex-start" gap="sm" wrap="nowrap">
                  <Avatar
                    size="md"
                    radius="xl"
                    className="bg-orange-100 text-orange-700 shrink-0"
                  >
                    {getInitials(authorName)}
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <Group justify="space-between" gap="sm" wrap="wrap">
                      <Text fw={600} size="sm" className="text-gray-900">
                        {authorName}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatCommentDate(comment.createdAt)}
                      </Text>
                    </Group>
                    <Text size="sm" className="text-gray-700 whitespace-pre-wrap mt-1">
                      {comment.message}
                    </Text>
                  </div>
                </Group>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
