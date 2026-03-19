"use client";

import { useMemo } from "react";
import { Drawer, Group, Text, Title, Button, Tabs } from "@mantine/core";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import {
  ArrowUpRight,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Paperclip,
  UserPlus,
  Wrench,
} from "lucide-react";
import { TicketDetailsViewModel } from "../(AdminLayout)/tickets/hooks/useTicketDetails";

interface TimelineEntry {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  text: React.ReactNode;
  date: string;
  time: string;
  highlight?: boolean;
}

interface IncidentUpdatesOverlayProps {
  opened: boolean;
  onClose: () => void;
  ticket?: TicketDetailsViewModel | null;
  onAddComment?: () => void;
  onResolve?: () => void;
  actionLoading?: boolean;
}

function formatEntryDateTime(iso: string | null | undefined): { date: string; time: string } {
  if (!iso) return { date: "--", time: "--" };
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return { date: "--", time: "--" };
  return {
    date: parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: parsed.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

function buildTimeline(ticket: TicketDetailsViewModel | null | undefined): TimelineEntry[] {
  if (!ticket) return [];

  const entries: (TimelineEntry & { _sortTs: number })[] = [];

  // 1. Ticket created
  if (ticket.createdAt) {
    const { date, time } = formatEntryDateTime(ticket.createdAt);
    entries.push({
      id: "created",
      _sortTs: new Date(ticket.createdAt).getTime(),
      icon: <UserPlus size={16} className="text-orange-700" />,
      iconBg: "bg-orange-100",
      text: ticket.createdBy ? (
        <>
          Ticket created by <strong>{ticket.createdBy}</strong>
        </>
      ) : (
        "Ticket created"
      ),
      date,
      time,
    });
  }

  // 2. Ticket assigned
  if (ticket.dateAssigned && ticket.assignedAgent?.fullName) {
    const { date, time } = formatEntryDateTime(ticket.dateAssigned);
    entries.push({
      id: "assigned",
      _sortTs: new Date(ticket.dateAssigned).getTime(),
      icon: <UserPlus size={16} className="text-orange-700" />,
      iconBg: "bg-orange-100",
      text: (
        <>
          Ticket assigned to <strong>{ticket.assignedAgent.fullName}</strong>
        </>
      ),
      date,
      time,
    });
  }

  // 3. Status changed (skip if still OPEN or updatedAt matches createdAt)
  if (
    ticket.statusCode &&
    ticket.statusCode !== "OPEN" &&
    ticket.updatedAt &&
    ticket.updatedAt !== ticket.createdAt
  ) {
    const { date, time } = formatEntryDateTime(ticket.updatedAt);
    entries.push({
      id: "status",
      _sortTs: new Date(ticket.updatedAt).getTime(),
      icon: <Wrench size={16} className="text-amber-700" />,
      iconBg: "bg-amber-100",
      text: (
        <>
          Status changed to <strong>{ticket.statusLabel}</strong>
        </>
      ),
      date,
      time,
      highlight: true,
    });
  }

  // 4. Attachments uploaded
  ticket.attachments?.forEach((attachment, idx) => {
    if (!attachment.createdAt) return;
    const { date, time } = formatEntryDateTime(attachment.createdAt);
    const label =
      attachment.fileName?.trim() ||
      attachment.fileUrl?.split("/").pop() ||
      "File";
    entries.push({
      id: `attachment-${attachment.id ?? idx}`,
      _sortTs: new Date(attachment.createdAt).getTime(),
      icon: <Paperclip size={16} className="text-orange-700" />,
      iconBg: "bg-orange-100",
      text: (
        <>
          Attachment uploaded: <strong>{label}</strong>
        </>
      ),
      date,
      time,
    });
  });

  // 5. Comments
  ticket.comments?.forEach((comment) => {
    if (!comment.createdAt) return;
    const { date, time } = formatEntryDateTime(comment.createdAt);
    entries.push({
      id: `comment-${comment.id}`,
      _sortTs: new Date(comment.createdAt).getTime(),
      icon: <MessageSquare size={16} className="text-blue-700" />,
      iconBg: "bg-blue-100",
      text: (
        <div className="space-y-1">
          <span>Comment added</span>
          <p className="text-xs text-gray-500 mt-0.5 italic">
            &ldquo;{comment.message}&rdquo;
          </p>
        </div>
      ),
      date,
      time,
    });
  });

  // Sort ascending by timestamp
  entries.sort((a, b) => a._sortTs - b._sortTs);

  return entries.map((entry) => ({
    id: entry.id,
    icon: entry.icon,
    iconBg: entry.iconBg,
    text: entry.text,
    date: entry.date,
    time: entry.time,
    highlight: entry.highlight,
  }));
}

export default function IncidentUpdatesOverlay({
  opened,
  onClose,
  ticket,
  onAddComment,
  onResolve,
  actionLoading = false,
}: IncidentUpdatesOverlayProps) {
  const timeline = useMemo(() => buildTimeline(ticket), [ticket]);

  const title = ticket?.caseType ?? "Incident Details";
  const description = ticket?.description ?? "";
  const attachmentCount = ticket?.attachments?.length ?? 0;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={480}
      zIndex={3000}
      withCloseButton={false}
      overlayProps={{ opacity: 0.55, blur: 2 }}
      classNames={{ body: "h-full" }}
    >
      <div className="flex flex-col h-full">
        <div>
          {/* Header */}
          <div className="space-y-1 mb-3">
            <Title order={4} className="text-body-heading-300 font-bold! text-xl!">
              {title}
            </Title>
            <Text size="sm" className="text-body-text-50!">
              {description}
            </Text>
          </div>

          {/* Tabs */}
          <Tabs
            color="orange"
            defaultValue="timeline"
            className="flex flex-col flex-1 min-h-0 rounded-lg overflow-hidden"
          >
            <Tabs.List className="border-b border-[#EAECF0] px-1 pt-1">
              <AdminTabButton value="timeline">Timeline</AdminTabButton>
              <AdminTabButton value="attachment">
                Attachments{attachmentCount > 0 ? ` (${attachmentCount})` : ""}
              </AdminTabButton>
            </Tabs.List>

            {/* ── Timeline Panel ── */}
            <Tabs.Panel value="timeline" className="flex-1 overflow-y-auto pb-4 pt-4">
              <Group gap="sm" mb="md">
                <Text size="sm" c="dimmed">
                  SLA:
                </Text>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                  02:00:00
                </span>
              </Group>

              {timeline.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" mt="xl">
                  No timeline events available.
                </Text>
              ) : (
                <div>
                  {timeline.map((entry, index) => (
                    <div key={entry.id}>
                      <div
                        className={`relative rounded-lg p-4 ${
                          entry.highlight
                            ? "bg-amber-50 border border-amber-100"
                            : "bg-[#F7F7F7]"
                        }`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${entry.iconBg}`}
                          >
                            {entry.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <Text size="sm" className="text-gray-900" component="div">
                              {entry.text}
                            </Text>
                            <Group gap="xs" mt={8} className="text-gray-500">
                              <Group gap={4}>
                                <Calendar size={12} />
                                <Text size="xs">Date: {entry.date},</Text>
                              </Group>
                              <Group gap={4}>
                                <Clock size={12} />
                                <Text size="xs">{entry.time}</Text>
                              </Group>
                            </Group>
                          </div>
                        </div>
                      </div>

                      {index < timeline.length - 1 && (
                        <div className="ml-8 my-1 h-5 w-px border-l-2 border-dashed border-[#D0D5DD]" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Tabs.Panel>

            {/* ── Attachments Panel ── */}
            <Tabs.Panel value="attachment" className="flex-1 overflow-y-auto pb-32 pt-4">
              <Group gap="sm" mb="md">
                <Text size="sm" c="dimmed">
                  Uploaded by:
                </Text>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                  Customer
                </span>
              </Group>

              {attachmentCount === 0 ? (
                <Text size="sm" c="dimmed" ta="center" mt="xl">
                  No attachments available.
                </Text>
              ) : (
                <div className="space-y-3">
                  {ticket!.attachments.map((attachment) => {
                    const fileName = attachment.fileName?.trim()
                      ? attachment.fileName
                      : attachment.fileUrl
                        ? attachment.fileUrl.split("/").pop() ?? "Attachment"
                        : "No attachment";

                    const fileSizeLabel =
                      typeof attachment.fileSize === "number" && attachment.fileSize > 0
                        ? `${Math.max(1, Math.round(attachment.fileSize / 1024))} KB`
                        : "--";

                    const hasUrl = Boolean(attachment.fileUrl);

                    return (
                      <div
                        key={attachment.id}
                        className="rounded-lg border border-gray-200 bg-[#F7F7F7] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-200">
                              <FileText size={20} className="text-gray-600" />
                            </div>
                            <div>
                              <Text
                                size="sm"
                                fw={500}
                                className="text-gray-900 break-all"
                              >
                                {fileName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {fileSizeLabel}
                              </Text>
                            </div>
                          </div>

                          {hasUrl ? (
                            <a
                              href={attachment.fileUrl ?? "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 shrink-0"
                            >
                              View
                              <ArrowUpRight size={14} />
                            </a>
                          ) : (
                            <Text size="xs" c="dimmed">
                              No document
                            </Text>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Tabs.Panel>
          </Tabs>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 left-0 right-0 z-10 py-5 -mx-4 -mb-4 mt-auto border-t border-[#E1E0E0] bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-4">
          <Group justify="center" gap="md">
            <Button
              color="#DD4F05"
              radius="xl"
              size="lg"
              className="font-medium! text-sm!"
              onClick={onResolve}
              loading={actionLoading}
              disabled={actionLoading}
            >
              Resolve Incident
            </Button>
            <Button
              variant="outline"
              radius="xl"
              size="lg"
              color="orange"
              className="font-medium! text-sm! border-orange-500! text-orange-600!"
              onClick={onAddComment}
              disabled={actionLoading}
            >
              Add Comment
            </Button>
          </Group>
        </div>
      </div>
    </Drawer>
  );
}