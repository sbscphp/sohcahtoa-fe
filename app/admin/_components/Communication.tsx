"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Group,
  Text,
  Button,
  TextInput,
  Textarea,
  Avatar,
  Skeleton,
  ActionIcon,
  Divider,
} from "@mantine/core";
import {
  Search,
  FileX,
  ChevronDown,
  ChevronUp,
  X,
  Maximize2,
  Minimize2,
  Bold,
  Italic,
  Quote,
  Link,
  Image as ImageIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
} from "lucide-react";
import EmptyState from "./EmptyState";

export interface RecipientOption {
  id: string;
  name: string;
}

export interface EmailItem {
  id: string;
  senderName: string;
  senderEmail: string;
  timestamp: string;
  preview: string;
  fullBody: string;
}

interface CommunicationProps {
  entityId?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  defaultComposeOpen?: boolean;
}

const MOCK_RECIPIENTS: RecipientOption[] = [
  { id: "r1", name: "Adekunle Ibrahim" },
  { id: "r2", name: "Moshood Aremu" },
  { id: "r3", name: "Sodiq Olajide" },
];

const MOCK_EMAILS_INITIAL: EmailItem[] = [
  {
    id: "e1",
    senderName: "Adekunle Ibrahim",
    senderEmail: "adekunle@gmail.com",
    timestamp: "1hr ago",
    preview: "I am yet to get a refuns still. My account has not been credited.",
    fullBody:
      "I am yet to get a refuns still. My account has not been credited. Please look into this matter as soon as possible. I have been waiting for over a week.",
  },
  {
    id: "e2",
    senderName: "Adekunle Ibrahim",
    senderEmail: "moshood@sohcahtoa.com",
    timestamp: "2hrs ago",
    preview: "Customer attempted to pay for Order #84722 via card (Mastercard – GTBank)",
    fullBody:
      "Customer attempted to pay for Order #84722 via card (Mastercard – GTBank). The transaction was declined. We have notified the customer to try an alternative payment method.",
  },
];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function Communication({
  entityId,
  emptyTitle = "No Communication Yet",
  emptyDescription = "Assign this incident to a staff for communication to begin",
  defaultComposeOpen = false,
}: CommunicationProps) {
  const [composeOpen, setComposeOpen] = useState(defaultComposeOpen);
  const [to, setTo] = useState<RecipientOption[]>([]);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [body, setBody] = useState(
    "A message has been sent to your bank. This will be resived very soon. We apologize for every inconvenice caused by this."
  );
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [maximizedId, setMaximizedId] = useState<string | null>(null);
  const [maximizeLoading, setMaximizeLoading] = useState(false);
  const [expandingId, setExpandingId] = useState<string | null>(null);

  // Simulate list fetch on mount
  useEffect(() => {
    const t = setTimeout(() => {
      setEmails(MOCK_EMAILS_INITIAL);
      setListLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, [entityId]);

  const removeTo = (id: string) => setTo((prev) => prev.filter((r) => r.id !== id));
  const addTo = (recipient: RecipientOption) => {
    if (to.some((r) => r.id === recipient.id)) return;
    setTo((prev) => [...prev, recipient]);
  };

  const handleSend = () => {
    if (to.length === 0) return;
    const newEmail: EmailItem = {
      id: `e${Date.now()}`,
      senderName: to[0].name,
      senderEmail: "noreply@sohcahtoa.com",
      timestamp: "Just now",
      preview: body.slice(0, 60) + (body.length > 60 ? "…" : ""),
      fullBody: body,
    };
    setEmails((prev) => [newEmail, ...prev]);
    setTo([]);
    setCc("");
    setBcc("");
    setBody("");
    setComposeOpen(false);
  };

  const handleMaximize = (id: string) => {
    setExpandingId(id);
    setMaximizeLoading(true);
    setTimeout(() => {
      setMaximizedId(id);
      setMaximizeLoading(false);
      setExpandingId(null);
    }, 600);
  };

  const handleMinimize = () => setMaximizedId(null);

  const emptyIcon = (
    <div className="relative flex items-center justify-center w-24 h-24 text-gray-300">
      <FileX size={48} strokeWidth={1.5} className="absolute" />
      <Search size={28} className="absolute opacity-80" />
    </div>
  );

  const showEmptyState = !listLoading && emails.length === 0 && !composeOpen;
  const showCompose = composeOpen;
  const showList = !listLoading && emails.length > 0;
  const showMaximized = maximizedId && !maximizeLoading;
  const maximizedEmail = maximizedId ? emails.find((e) => e.id === maximizedId) : null;

  return (
    <Card radius="lg" p="xl" className="bg-white shadow-sm mt-6">
      <Group justify="space-between" align="center" mb="md">
        <Text fw={600} size="lg" className="text-gray-900">
          Communication
        </Text>
        <Button
          variant="subtle"
          color="orange"
          size="sm"
          rightSection={composeOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          onClick={() => setComposeOpen((o) => !o)}
        >
          {composeOpen ? "Close" : "Compose"}
        </Button>
      </Group>

      {showCompose && (
        <>
          <Divider my="sm" />
          <div className="space-y-4">
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                To:
              </Text>
              <Group gap="xs" wrap="wrap">
                {to.map((r) => (
                  <span
                    key={r.id}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
                  >
                    {r.name}
                    <button
                      type="button"
                      onClick={() => removeTo(r.id)}
                      className="p-0.5 rounded hover:bg-gray-200"
                      aria-label={`Remove ${r.name}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                {to.length === 0 && (
                  <Text size="sm" c="dimmed">
                    Add recipients below
                  </Text>
                )}
              </Group>
              <Group gap="xs" mt="xs">
                {MOCK_RECIPIENTS.filter((r) => !to.some((t) => t.id === r.id)).map((r) => (
                  <Button
                    key={r.id}
                    variant="light"
                    size="xs"
                    color="gray"
                    onClick={() => addTo(r)}
                  >
                    + {r.name}
                  </Button>
                ))}
              </Group>
            </div>
            <TextInput label="CC:" placeholder="Optional" value={cc} onChange={(e) => setCc(e.currentTarget.value)} radius="md" />
            <TextInput label="BCC:" placeholder="Optional" value={bcc} onChange={(e) => setBcc(e.currentTarget.value)} radius="md" />
            <div>
              <Group gap={4} mb={4} className="flex-wrap">
                <ActionIcon variant="subtle" size="sm" color="gray"><Bold size={16} /></ActionIcon>
                <ActionIcon variant="subtle" size="sm" color="gray"><Italic size={16} /></ActionIcon>
                <ActionIcon variant="subtle" size="sm" color="gray"><Heading1 size={16} /></ActionIcon>
                <ActionIcon variant="subtle" size="sm" color="gray"><Heading2 size={16} /></ActionIcon>
                <ActionIcon variant="subtle" size="sm" color="gray"><Quote size={16} /></ActionIcon>
                <ActionIcon variant="subtle" size="sm" color="gray"><Link size={16} /></ActionIcon>
                <ActionIcon variant="subtle" size="sm" color="gray"><ImageIcon size={16} /></ActionIcon>
                <ActionIcon variant="subtle" size="sm" color="gray"><List size={16} /></ActionIcon>
                <ActionIcon variant="subtle" size="sm" color="gray"><ListOrdered size={16} /></ActionIcon>
              </Group>
              <Textarea
                placeholder="Write your message..."
                value={body}
                onChange={(e) => setBody(e.currentTarget.value)}
                minRows={5}
                radius="md"
              />
            </div>
            <Group justify="flex-end">
              <Button color="#DD4F05" radius="xl" onClick={handleSend} disabled={to.length === 0}>
                Send
              </Button>
            </Group>
          </div>
          <Divider my="md" />
        </>
      )}

      {listLoading && (
        <div className="space-y-4 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 items-start">
              <Skeleton height={40} width={40} radius="xl" />
              <div className="flex-1 space-y-2">
                <Skeleton height={14} width="40%" />
                <Skeleton height={12} width="60%" />
                <Skeleton height={12} width="80%" />
              </div>
            </div>
          ))}
        </div>
      )}

      {showEmptyState && !showCompose && (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={emptyIcon}
        />
      )}

      {maximizeLoading && expandingId && (
        <div className="py-8 flex flex-col items-center justify-center gap-4">
          <Skeleton height={200} width="100%" radius="md" />
          <Text size="sm" c="dimmed">
            Loading message...
          </Text>
        </div>
      )}

      {showMaximized && maximizedEmail && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
          <Group justify="space-between" mb="md">
            <Group gap="sm">
              <Avatar size="md" radius="xl" className="bg-orange-100 text-orange-700">
                {getInitials(maximizedEmail.senderName)}
              </Avatar>
              <div>
                <Text fw={600} size="sm">{maximizedEmail.senderName}</Text>
                <Text size="xs" c="dimmed">From: {maximizedEmail.senderEmail}</Text>
              </div>
            </Group>
            <Group gap="xs">
              <Text size="xs" c="dimmed">{maximizedEmail.timestamp}</Text>
              <ActionIcon variant="light" size="sm" color="blue" onClick={handleMinimize} title="Minimize">
                <Minimize2 size={16} />
              </ActionIcon>
            </Group>
          </Group>
          <Text size="sm" className="text-gray-700 whitespace-pre-wrap">
            {maximizedEmail.fullBody}
          </Text>
        </div>
      )}

      {showList && !showMaximized && !maximizeLoading && (
        <>
          <div className="space-y-4">
            {emails.map((email) => {
              return (
                <div
                  key={email.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 transition-colors"
                >
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap" className="min-w-0 flex-1">
                      <Avatar size="md" radius="xl" className="bg-orange-100 text-orange-700 shrink-0">
                        {getInitials(email.senderName)}
                      </Avatar>
                      <div className="min-w-0">
                        <Text fw={600} size="sm" className="text-gray-900">
                          {email.senderName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          From: {email.senderEmail}
                        </Text>
                        <Text size="sm" className="text-gray-600 mt-1 line-clamp-1">
                          {email.preview}
                        </Text>
                      </div>
                    </Group>
                    <Group gap="xs" className="shrink-0!">
                      <Text size="xs" c="dimmed">
                        {email.timestamp}
                      </Text>
                      <ActionIcon
                        variant="light"
                        size="sm"
                        color="blue"
                        onClick={() => handleMaximize(email.id)}
                        title="Expand"
                      >
                        <Maximize2 size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}
