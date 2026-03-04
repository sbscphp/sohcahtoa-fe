import { Menu, Button, Avatar } from "@mantine/core";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AgentHeaderMenu() {
  const router = useRouter();
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
          <Avatar name="Michael Smith" color="initials" size={40} radius="xl" />
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
