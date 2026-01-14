"use client";

import { Group, Text, Badge, ActionIcon } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface ListItemProps {
  title: string;
  description?: string;
  date?: string;
  time?: string;
  badge?: {
    label: string;
    color?: string;
  };
  icon?: ReactNode;
  onClick?: () => void;
}

export default function ListItem({
  title,
  description,
  date,
  time,
  badge,
  icon,
  onClick,
}: ListItemProps) {
  return (
    <Group
      justify="space-between"
      align="flex-start"
      className={`py-2 ${onClick ? "cursor-pointer hover:bg-gray-50 rounded-md px-2" : ""}`}
      onClick={onClick}
    >
      <div className="flex-1">
        <Group gap="xs" mb={4}>
          <Text size="sm" fw={500}>
            {title}
          </Text>
          {badge && (
            <Badge color={badge.color || "orange"} size="xs" variant="light">
              {badge.label}
            </Badge>
          )}
        </Group>

        {description && (
          <Text size="xs" c="dimmed" mb={4}>
            {description}
          </Text>
        )}

        {(date || time) && (
          <Group gap={4}>
            <Text size="xs" c="dimmed">
              {date}
            </Text>
            {date && time && (
              <Text size="xs" c="dimmed">
                ·
              </Text>
            )}
            <Text size="xs" c="dimmed">
              {time}
            </Text>
          </Group>
        )}
      </div>

      {icon ? (
        icon
      ) : (
        <ActionIcon variant="subtle" color="gray" size="sm">
          <ChevronRight size={16} />
        </ActionIcon>
      )}
    </Group>
  );
}
