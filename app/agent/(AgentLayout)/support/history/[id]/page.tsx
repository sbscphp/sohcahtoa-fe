"use client";

import { Card, Text, Group, Stack, Badge, Divider } from "@mantine/core";
import { useRouter, useParams } from "next/navigation";
import { MessageSquare } from "lucide-react";

interface SupportDetail {
  category: string;
  status: string;
  date: string;
  email: string;
  userMessage: string;
  supportEmail: string;
  supportDate: string;
  supportMessage: string;
}

const mockDetails: Record<string, SupportDetail> = {
  "1": {
    category: "Failed login/password reset not working",
    status: "Approved",
    date: "Sep 29, 2025 10:28am",
    email: "fiyinsohcahtoa@gmail.com",
    userMessage:
      "Hello Support,\n\nI'm writing to you that have been experiencing difficulties accessing my account. Each time I attempt to reset my password, I do receive the reset email, however, the link provided does not seem to function properly. I have tried multiple times, across different devices and browsers, but the issue persist.",
    supportEmail: "support@sohcahtoa.com",
    supportDate: "Sep 29, 2025 10:28am",
    supportMessage:
      "Hello Fiyin,\n\nThank you for reaching out to us regarding the difficulty you experienced with resetting your password. We have refreshed your account security settings and sent you a new password reset link to your registered email address. Once you open the link, you'll be able to create a new password and regain access to your account.\n\nThank you for your patience and for choosing our services.",
  },
};

function DetailRow({
  label,
  value,
  align = "left",
  valueStyle,
}: {
  label: string;
  value: string;
  align?: "left" | "right";
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div className={`flex flex-col ${align === "right" ? "items-end" : "items-start"}`}>
      <Text size="xs" c="dimmed" mb={4}>
        {label}
      </Text>
      <Text fw={500} size="sm" style={valueStyle}>
        {value}
      </Text>
    </div>
  );
}

export default function ViewSupportRequestPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const data = mockDetails[id] || mockDetails["1"];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Group gap="xs">
        <Text
          size="sm"
          c="dimmed"
          className="cursor-pointer hover:text-primary-400"
          onClick={() => router.push("/agent/support/history")}
        >
          Support
        </Text>
        <Text size="sm" c="dimmed">
          /
        </Text>
        <Text size="sm" fw={500}>
          View request
        </Text>
      </Group>

      {/* Support Request Card */}
      <Card radius="md" padding="lg" withBorder>
        <Stack gap="lg">
          {/* Header */}
          <div>
            <Text fw={600} size="xl" mb="xs">
              Support
            </Text>
            <Text size="sm" c="dimmed">
              View request
            </Text>
          </div>

          {/* User Request Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            <DetailRow label="Category" value={data.category} />
            <DetailRow
              align="right"
              label="Status"
              value={data.status}
              valueStyle={{
                color: data.status === "Approved" ? "#2563eb" : undefined,
              }}
            />
            <DetailRow label="Date & Time" value={data.date} />
            <DetailRow label="Email" value={data.email} align="right" />
          </div>

          {/* User Message */}
          <div className="pt-2">
            <Text size="sm" className="whitespace-pre-wrap">
              {data.userMessage}
            </Text>
          </div>

          <Divider my="md" />

          {/* Support Response Section */}
          <div>
            <Group gap="xs" mb="md">
              <div className="w-8 h-8 rounded bg-primary-50 flex items-center justify-center">
                <MessageSquare size={18} className="text-primary-400" />
              </div>
              <Text fw={500} size="sm">
                Message
              </Text>
            </Group>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 mb-4">
              <DetailRow label="Support team" value={data.supportEmail} />
              <DetailRow
                align="right"
                label="Status"
                value={data.status}
                valueStyle={{
                  color: data.status === "Approved" ? "#2563eb" : undefined,
                }}
              />
              <DetailRow label="Date & Time" value={data.supportDate} />
              <DetailRow label="Email" value={data.email} align="right" />
            </div>

            {/* Support Message */}
            <div className="pt-2">
              <Text size="sm" className="whitespace-pre-wrap">
                {data.supportMessage}
              </Text>
            </div>
          </div>
        </Stack>
      </Card>
    </div>
  );
}
