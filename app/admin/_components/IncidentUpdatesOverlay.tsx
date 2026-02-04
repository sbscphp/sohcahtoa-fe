"use client";

import { Drawer, Group, Text, Title, Button, Tabs } from "@mantine/core";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import { ArrowUpRight, Calendar, Clock, FileText, Mail, Pencil, UserPlus, Wrench } from "lucide-react";

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
  title?: string;
  description?: string;
  ticketId?: string;
}

const MOCK_TIMELINE: TimelineEntry[] = [
  {
    id: "1",
    icon: <UserPlus size={16} className="text-orange-700" />,
    iconBg: "bg-orange-100",
    text: (
      <>
        Ticket created by <strong>Sodiq Olajide</strong>
      </>
    ),
    date: "April 11",
    time: "11:00 am",
  },
  {
    id: "2",
    icon: <UserPlus size={16} className="text-orange-700" />,
    iconBg: "bg-orange-100",
    text: (
      <>
        Ticket assigned to <strong>Moshood Aremu</strong>
      </>
    ),
    date: "April 11",
    time: "11:03 am",
  },
  {
    id: "3",
    icon: <Wrench size={16} className="text-amber-700" />,
    iconBg: "bg-amber-100",
    text: (
      <>
        Status changed to <strong>In progress</strong>
      </>
    ),
    date: "April 11",
    time: "11:05 am",
  },
  {
    id: "4",
    icon: <Mail size={16} className="text-orange-700" />,
    iconBg: "bg-orange-100",
    text: (
      <>
        Reply sent to <strong>Customer</strong>
      </>
    ),
    date: "April 11",
    time: "11:08 am",
  },
  {
    id: "5",
    icon: <Pencil size={16} className="text-amber-700" />,
    iconBg: "bg-amber-100",
    text: (
      <div className="space-y-2">
        <span>Incident details updated</span>
        <div className="flex flex-wrap gap-1 mt-1">
          <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
            Case Type
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
            Description
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
            Priority
          </span>
        </div>
      </div>
    ),
    date: "April 11",
    time: "11:00 am",
    highlight: true,
  },
];

export default function IncidentUpdatesOverlay({
  opened,
  onClose,
  title = "Incident Action Type Title",
  description = "A one line short context text is here to describe",
  ticketId,
}: IncidentUpdatesOverlayProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={480}
      withCloseButton={false}
      overlayProps={{ opacity: 0.55, blur: 2 }}
    >
      <div className="flex flex-col h-full">
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
            <AdminTabButton value="attachment">Attachment</AdminTabButton>
          </Tabs.List>

          <Tabs.Panel value="timeline" className="flex-1 overflow-y-auto pb-4 pt-4">
            <Group gap="sm" mb="md">
              <Text size="sm" c="dimmed">
                SLA:
              </Text>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                02:00:00
              </span>
            </Group>

            <div className="relative pl-8">
              {/* Dashed vertical line */}
              <div
                className="absolute left-3 top-2 bottom-2 w-px border-l-2 border-dashed border-gray-300"
                aria-hidden
              />

              <div className="space-y-4">
                {MOCK_TIMELINE.map((entry) => (
                  <div
                    key={entry.id}
                    className={`relative rounded-lg p-4 ${
                      entry.highlight ? "bg-amber-50 border border-amber-100" : "bg-[#F7F7F7]"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${entry.iconBg}`}
                      >
                        {entry.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Text size="sm" className="text-gray-900">
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
                ))}
              </div>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="attachment" className="flex-1 overflow-y-auto pb-32 pt-4">
            <div className="space-y-4">
              <Group gap="sm">
                <Text size="sm" c="dimmed">
                  Uploaded by:
                </Text>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                  Customer
                </span>
              </Group>

              <div className="rounded-lg border border-gray-200 bg-[#F7F7F7] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-200">
                      <FileText size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <Text size="sm" fw={500} className="text-gray-900">
                        CAC Document
                      </Text>
                      <Text size="xs" c="dimmed">
                        100 KB
                      </Text>
                    </div>
                  </div>
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 shrink-0"
                  >
                    View Document
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </Tabs.Panel>
        </Tabs>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 left-0 right-0 z-10 py-5 -mx-4 -mb-4 mt-auto border-t border-[#E1E0E0] bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-4">
          <Group justify="center" gap="md">
            <Button color="#DD4F05" radius="xl" size="lg" className="font-medium! text-sm!">
              Resolve Incident
            </Button>
            <Button
              variant="outline"
              radius="xl"
              size="lg"
              color="orange"
              className="font-medium! text-sm! border-orange-500! text-orange-600!"
            >
              Add Comment
            </Button>
          </Group>
        </div>
      </div>
    </Drawer>
  );
}
