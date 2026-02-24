"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Checkbox, Stack, Text } from "@mantine/core";
import { Mail, MessageSquare } from "lucide-react";
import SectionCard from "@/app/(customer)/_components/dashboard/SectionCard";

interface NotificationPreference {
  id: string;
  type: "email" | "sms";
  label: string;
  description: string;
  email?: string;
  enabled: boolean;
}

const MOCK_PREFERENCES: NotificationPreference[] = [
  {
    id: "1",
    type: "email",
    label: "Email Alerts",
    description: "receive updates and notifications via email---",
    email: "Dejoefyn@brown.com",
    enabled: true,
  },
  {
    id: "2",
    type: "sms",
    label: "SMS Alerts",
    description: "get quick text message alerts on your phone",
    enabled: false,
  },
];

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState(MOCK_PREFERENCES);
  const [saving, setSaving] = useState(false);

  const handleToggle = (id: string) => {
    setPreferences((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    // TODO: API save preferences
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    router.push("/agent/settings");
  };

  return (
    <SectionCard className="rounded-2xl p-4 md:p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[#323131] mb-2">
            Notifications settings
          </h2>
          <p className="text-base font-normal text-[#6C6969]">
            Choose the channel you prefer for receiving alerts
          </p>
        </div>

        <Stack gap="md">
          {preferences.map((pref) => (
            <div
              key={pref.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-25">
                  {pref.type === "email" ? (
                    <Mail size={24} className="text-primary-400" />
                  ) : (
                    <MessageSquare size={24} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <Text fw={600} size="sm" className="text-[#4D4B4B]">
                    {pref.label}
                  </Text>
                  <Text size="xs" c="dimmed" className="text-[#6C6969]">
                    {pref.description}
                    {pref.email && ` ${pref.email}`}
                  </Text>
                </div>
              </div>
              <Checkbox
                checked={pref.enabled}
                onChange={() => handleToggle(pref.id)}
                size="md"
                color="orange"
              />
            </div>
          ))}
        </Stack>

        <div className="flex flex-row flex-wrap items-start gap-6 pt-4">
          <Button
            variant="default"
            className="!h-[52px] !min-w-[188px] !rounded-full !border-[#CCCACA] !bg-white !px-6 !py-3.5 !text-base !font-medium !leading-6 !text-[#4D4B4B] hover:!bg-gray-50"
            onClick={() => router.push("/agent/settings")}
          >
            Back
          </Button>
          <Button
            className="!h-[52px] !min-w-[188px] !rounded-full !bg-primary-400 !px-6 !py-3.5 !text-base !font-medium !leading-6 !text-[#FFF6F1] hover:!bg-primary-500"
            onClick={handleSave}
            loading={saving}
          >
            Save changes
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}
