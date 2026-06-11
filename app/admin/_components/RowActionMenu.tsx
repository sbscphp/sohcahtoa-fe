"use client";

import { Menu, ActionIcon } from "@mantine/core";
import {
  TbExclamationMark,
  TbEye,
  TbEdit,
  TbBan,
} from "react-icons/tb";

interface RowActionMenuProps {
  onView: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
  deactivateLabel?: string;
}

export default function RowActionMenu({
  onView,
  onEdit,
  onDeactivate,
  deactivateLabel = "Deactivate",
}: RowActionMenuProps) {
  return (
    <Menu shadow="md" width={180} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="light" radius="xl">
          <TbExclamationMark size={18} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item leftSection={<TbEye size={16} />} onClick={onView}>
          View
        </Menu.Item>

        <Menu.Item leftSection={<TbEdit size={16} />} onClick={onEdit}>
          Edit
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          leftSection={<TbBan size={16} />}
          color="orange"
          onClick={onDeactivate}
        >
          {deactivateLabel}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
