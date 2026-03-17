import { Menu, Button, Avatar } from "@mantine/core";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/app/_lib/atoms/auth-atom";
import { getDisplayNameFromProfile } from "@/app/_lib/utils/account-format";

export default function AgentHeaderMenu() {
  const router = useRouter();
  const userProfile = useAtomValue(userProfileAtom);
  const display = userProfile ? getDisplayNameFromProfile(userProfile) : null;
  const displayName = display?.displayName ?? "Agent";
  const initials = display?.initials ?? "A";
  const avatarUrl = userProfile?.profile?.avatar || undefined;

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button
          rightSection={<ChevronDown size={14} />}
          variant="transparent"
          radius="xl"
          className="hover:bg-gray-50"
          size="lg"
        >
          <Avatar src={avatarUrl} name={displayName} color="initials" size={40} radius="xl">
            {initials}
          </Avatar>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
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
