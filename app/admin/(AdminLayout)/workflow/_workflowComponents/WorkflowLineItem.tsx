"use client";

import { Select, Button, Avatar, Text, ScrollArea, ActionIcon } from "@mantine/core";
import { ChevronDown, ChevronUp, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { AssignableUser, AssignableRole } from "./AssignToModal";

export interface WorkflowLine {
  id: string;
  workflowType: string;
  escalationPeriod: number;
  escalateToUser?: { id: string; name: string };
  selectedUsers: AssignableUser[];
  selectedRoles: AssignableRole[];
  expanded: boolean;
}

interface WorkflowLineItemProps {
  line: WorkflowLine;
  index: number;
  totalLines: number;
  onUpdateWorkflowType: (id: string, type: string) => void;
  onOpenEscalationModal: (id: string) => void;
  onOpenAssignModal: (id: string) => void;
  onToggleExpanded: (id: string) => void;
  onRemoveUser: (lineId: string, userId: string) => void;
  onRemoveRole: (lineId: string, roleId: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
}

const WORKFLOW_TYPES = ["Review", "Approval", "Documentation", "Verification"];

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

export default function WorkflowLineItem({
  line,
  index,
  totalLines,
  onUpdateWorkflowType,
  onOpenEscalationModal,
  onOpenAssignModal,
  onToggleExpanded,
  onRemoveUser,
  onRemoveRole,
  onMoveUp,
  onMoveDown,
  onDelete,
}: WorkflowLineItemProps) {
  const badgeColor = index === 0 ? "bg-orange-500" : "bg-green-500";
  const totalAssigned = line.selectedUsers.length + line.selectedRoles.length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="space-y-4">
        {/* Header Row */}
        <div className="flex items-start gap-4">
          {/* Number Badge */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${badgeColor} text-white font-semibold`}
          >
            {index + 1}
          </div>

          {/* Workflow Type and Escalation */}
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Workflow Type */}
              <Select
                label="Workflow Type"
                placeholder="Select an Option"
                data={WORKFLOW_TYPES}
                value={line.workflowType}
                onChange={(value) => value && onUpdateWorkflowType(line.id, value)}
                required
                radius="md"
                classNames={{
                  label: "text-sm font-medium text-gray-900 mb-1",
                }}
              />

              {/* Escalation Protocol */}
              <div>
                <Text size="sm" fw={500} className="text-gray-900 mb-1">
                  Escalation protocol <span className="text-red-500">*</span>
                </Text>
                <Button
                  variant="outline"
                  color="gray"
                  radius="md"
                  fullWidth
                  onClick={() => onOpenEscalationModal(line.id)}
                  className="justify-start font-normal text-left"
                >
                  {line.escalateToUser ? (
                    <span className="text-gray-900">
                      {line.escalationPeriod} mins | {line.escalateToUser.name}
                    </span>
                  ) : (
                    <span className="text-gray-400">00 mins | Escalate To</span>
                  )}
                </Button>
              </div>
            </div>

            {/* Select Admin Users Section */}
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <Text size="sm" fw={500} className="text-gray-900">
                    Select Admin users ({String(totalAssigned).padStart(2, "0")})
                  </Text>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="orange"
                    onClick={() => onOpenAssignModal(line.id)}
                  >
                    <Plus size={16} />
                  </ActionIcon>
                </div>

                <div className="flex items-center gap-2">
                  {index > 0 && (
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="orange"
                      onClick={() => onMoveUp(line.id)}
                    >
                      <ArrowUp size={16} />
                    </ActionIcon>
                  )}
                  {index < totalLines - 1 && (
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="orange"
                      onClick={() => onMoveDown(line.id)}
                    >
                      <ArrowDown size={16} />
                    </ActionIcon>
                  )}
                  {totalLines > 1 && (
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      onClick={() => onDelete(line.id)}
                    >
                      <Trash2 size={16} />
                    </ActionIcon>
                  )}
                  <ActionIcon 
                    size="sm" 
                    variant="subtle" 
                    color="gray"
                    onClick={() => onToggleExpanded(line.id)}
                  >
                    {line.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </ActionIcon>
                </div>
              </div>

              {/* Expanded Content */}
              {line.expanded && (totalAssigned > 0) && (
                <div className="mt-3">
                  <ScrollArea h={200} type="scroll">
                    <div className="space-y-2">
                      {/* Selected Users */}
                      {line.selectedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 rounded-lg border border-gray-200 p-2"
                        >
                          <Avatar
                            size="sm"
                            radius="xl"
                            className="bg-orange-100 text-orange-700 shrink-0"
                          >
                            {getInitials(user.name)}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <Text size="sm" fw={500} className="text-gray-900 truncate">
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
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="red"
                            onClick={() => onRemoveUser(line.id, user.id)}
                          >
                            <Trash2 size={14} />
                          </ActionIcon>
                        </div>
                      ))}

                      {/* Selected Roles */}
                      {line.selectedRoles.map((role) => (
                        <div
                          key={role.id}
                          className="flex items-center gap-3 rounded-lg border border-gray-200 p-2"
                        >
                          <Avatar
                            size="sm"
                            radius="xl"
                            className="bg-orange-100 text-orange-700 shrink-0"
                          >
                            {getInitials(role.name)}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <Text size="sm" fw={500} className="text-gray-900 truncate">
                              {role.name}
                            </Text>
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                              {role.userCount} Users
                            </span>
                          </div>
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="red"
                            onClick={() => onRemoveRole(line.id, role.id)}
                          >
                            <Trash2 size={14} />
                          </ActionIcon>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
