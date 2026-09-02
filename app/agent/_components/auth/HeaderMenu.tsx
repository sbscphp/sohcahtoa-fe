"use client";

import { Menu, Button, Avatar } from "@mantine/core";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useHydratedProfileDisplay } from "@/app/_lib/hooks/use-hydrated-profile-display";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
  return `${parts[0]!.slice(0, 1)}${parts[parts.length - 1]!.slice(0, 1)}`.toUpperCase();
}

export default function AgentHeaderMenu() {
  const router = useRouter();
  const { hydrated, displayName, avatarUrl } = useHydratedProfileDisplay({
    fallbackName: "Agent",
  });
  const initials = hydrated ? initialsFromName(displayName) : "A";

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button
          rightSection={<ChevronDown size={14} />}
          variant="transparent"
          radius="xl"
          className="hover:bg-gray-50"
          size="lg"
          p={0}
        >
          {hydrated ? (
            <Avatar
              src={avatarUrl}
              name={displayName}
              color="initials"
              size={40}
              radius="xl"
              p={0}
            >
              {initials}
            </Avatar>
          ) : (
            <div
              className="flex size-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-500"
              aria-hidden
            >
              …
            </div>
          )}
        </Button>
      </Menu.Target>

      <Menu.Dropdown p={0}>
        <Menu.Item
          leftSection={<Settings size={14} />}
          onClick={() => {
            router.push("/agent/settings");
          }}
        >
          Settings
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          color="red"
          leftSection={<LogOut size={14} />}
          onClick={() => {
            router.push("/agent/auth/login");
          }}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
