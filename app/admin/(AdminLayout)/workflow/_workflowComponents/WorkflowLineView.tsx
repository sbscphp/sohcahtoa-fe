"use client";

import { useState } from "react";
import { Text, Avatar, ScrollArea, ActionIcon } from "@mantine/core";
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown } from "lucide-react";

export interface ViewUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface ViewWorkflowLine {
  id: string;
  workflowType: string;
  escalationPeriod: number;
  escalateToName: string;
  users: ViewUser[];
}

interface WorkflowLineViewProps {
  line: ViewWorkflowLine;
  index: number;
  totalLines: number;
}

function getInitials(name: string): string {
  return name
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const ROLE_PILL_COLORS: Record<string, string> = {
  "Internal Control": "bg-blue-100 text-blue-700",
  Finance: "bg-blue-100 text-blue-700",
  "IT Support": "bg-blue-100 text-blue-700",
  "Head of Audit": "bg-green-100 text-green-700",
  "IT Manager": "bg-green-100 text-green-700",
  "Chief Financial Officer": "bg-green-100 text-green-700",
};

export default function WorkflowLineView({
  line,
  index,
  totalLines,
}: WorkflowLineViewProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header Row */}
      <div className="flex items-center gap-4">
        {/* Number Badge */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700 font-semibold">
          {index + 1}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Text fw={700} size="sm" className="text-gray-900">
              {line.workflowType}
            </Text>
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              Users: {line.users.length}
            </span>
          </div>
          <Text size="sm" c="dimmed" mt={2}>
            Escalation Protocol: <span className="font-semibold text-gray-900">{line.escalationPeriod} mins</span> | {line.escalateToName}
          </Text>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {index > 0 && (
            <ActionIcon size="sm" variant="subtle" color="orange" className="cursor-default">
              <ArrowUp size={16} />
            </ActionIcon>
          )}
          {index < totalLines - 1 && (
            <ActionIcon size="sm" variant="subtle" color="orange" className="cursor-default">
              <ArrowDown size={16} />
            </ActionIcon>
          )}
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </ActionIcon>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && line.users.length > 0 && (
        <div className="mt-4 rounded-lg border border-orange-200 p-3">
          <div className="flex items-center gap-2 mb-3">
            <Text size="sm" fw={500} className="text-gray-900">
              Admin users ({String(line.users.length).padStart(2, "0")}) +
            </Text>
          </div>

          <ScrollArea h={220} type="scroll">
            <div className="space-y-2">
              {line.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                >
                  <Avatar
                    size="md"
                    radius="xl"
                    className="bg-orange-100 text-orange-700 shrink-0"
                  >
                    {getInitials(user.name)}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Text size="sm" fw={600} className="text-gray-900 truncate">
                      {user.name}
                    </Text>
                    <Text size="xs" c="dimmed" className="truncate">
                      {user.email}
                    </Text>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            ROLE_PILL_COLORS[role] ?? "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
