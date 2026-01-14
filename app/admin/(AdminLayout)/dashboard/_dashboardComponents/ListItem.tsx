"use client";

import { Group, Text, ActionIcon } from "@mantine/core";
import { ChevronRight, Calendar, Clock } from "lucide-react";
import { ReactNode } from "react";
import { StatusBadge } from "../../../_components/StatusBadge";

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
  showIcons?: boolean;
  cardStyle?: boolean;
}

export default function ListItem({
  title,
  description,
  date,
  time,
  badge,
  icon,
  onClick,
  showIcons = false,
  cardStyle = false,
}: ListItemProps) {
  const content = (
    <Group
      justify="space-between"
      align="flex-start"
      className={`w-full ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className="flex-1">
        <Text size="sm" fw={500} mb={4}>
          {title}
        </Text>

        {description && (
          <Text size="xs" c="dimmed" mb={8}>
            {description}
          </Text>
        )}

        {(date || time) && (
          <Group gap="xs" wrap="nowrap" mt={4}>
            {showIcons ? (
              <>
                {date && (
                  <>
                    <Calendar size={12} className="text-gray-400" />
                    <Text size="xs" c="dimmed">
                      {date}
                    </Text>
                  </>
                )}
                {time && (
                  <>
                    <Clock size={12} className="text-gray-400" />
                    <Text size="xs" c="dimmed">
                      {time}
                    </Text>
                  </>
                )}
              </>
            ) : (
              <>
                {date && (
                  <Text size="xs" c="dimmed">
                    {date}
                  </Text>
                )}
                {date && time && (
                  <Text size="xs" c="dimmed">
                    ·
                  </Text>
                )}
                {time && (
                  <Text size="xs" c="dimmed">
                    {time}
                  </Text>
                )}
              </>
            )}
          </Group>
        )}
      </div>

      <Group gap="xs" wrap="nowrap">
        {badge && (
          <StatusBadge
            status={badge.label}
            color={badge.color}
          />
        )}
        {icon ? (
          icon
        ) : (
          <ActionIcon variant="subtle" color="gray" size="sm">
            <ChevronRight size={16} />
          </ActionIcon>
        )}
      </Group>
    </Group>
  );

  if (cardStyle) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        {content}
      </div>
    );
  }

  return content;
}
