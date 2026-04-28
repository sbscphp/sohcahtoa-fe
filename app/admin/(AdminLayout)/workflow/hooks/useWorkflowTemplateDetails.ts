"use client";

import { useMemo } from "react";
import type { ApiResponse } from "@/app/_lib/api/client";
import { useFetchSingleData } from "@/app/_lib/api/hooks";
import {
  adminApi,
  type WorkflowTemplateDetailsData,
  type WorkflowTemplateStage,
} from "@/app/admin/_services/admin-api";
import type { ViewWorkflowLine, ViewUser } from "../_workflowComponents/WorkflowLineView";

interface WorkflowTemplateDetailsResponse extends ApiResponse<WorkflowTemplateDetailsData> {}

export interface WorkflowTemplateDetailsViewModel {
  id: string;
  name: string;
  dateCreated: string;
  timeCreated: string;
  status: "Active" | "Deactivated" | "Draft";
  workflowAction: string;
  description: string;
  branch: string;
  department: string;
  workflowType: string;
  personnelProcesses: ViewWorkflowLine[];
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toTitleCase(value: string): string {
  const normalized = value.trim().replace(/[_-]+/g, " ");
  if (!normalized) return "";
  return normalized
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: unknown): string {
  const source = String(value ?? "").trim();
  if (!source) return "--";
  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return "--";

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: unknown): string {
  const source = String(value ?? "").trim();
  if (!source) return "--";
  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) return "--";

  return parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function mapStatus(value: unknown): "Active" | "Deactivated" | "Draft" {
  const normalized = asString(value).trim().toUpperCase();
  if (normalized === "DEACTIVATED" || normalized === "INACTIVE") return "Deactivated";
  if (normalized === "DRAFT") return "Draft";
  return "Active";
}

function mapAssigneeToUser(adminId: string, stageType: string): ViewUser {
  const shortId = adminId.slice(0, 8).toUpperCase();
  return {
    id: adminId,
    name: `Admin ${shortId}`,
    email: "--",
    roles: [toTitleCase(stageType) || "User"],
  };
}

function mapStageToViewLine(stage: WorkflowTemplateStage): ViewWorkflowLine {
  return {
    id: stage.id,
    workflowType: toTitleCase(asString(stage.type, "Review")),
    escalationPeriod: Number.isFinite(stage.escalationMinutes) ? stage.escalationMinutes : 0,
    escalateToName: "--",
    users: (stage.assignees ?? []).map((assignee) =>
      mapAssigneeToUser(assignee.adminId, stage.type)
    ),
  };
}

function normalizeTemplate(data: WorkflowTemplateDetailsData | null): WorkflowTemplateDetailsViewModel | null {
  if (!data) return null;

  const createdAtCandidate = "";
  const stages = [...(data.stages ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return {
    id: asString(data.id),
    name: asString(data.name, "--"),
    dateCreated: formatDate(createdAtCandidate),
    timeCreated: formatTime(createdAtCandidate),
    status: mapStatus(data.status),
    workflowAction: asString(data.action, "--"),
    description: asString(data.description, "--"),
    branch: data.branchId ? asString(data.branchId, "--") : "--",
    department: data.departmentId ? asString(data.departmentId, "--") : "--",
    workflowType: toTitleCase(asString(data.processType, "--")),
    personnelProcesses: stages.map(mapStageToViewLine),
  };
}

export function useWorkflowTemplateDetails(id?: string) {
  const query = useFetchSingleData<WorkflowTemplateDetailsResponse>(
    ["admin", "workflow", "template", id ?? ""],
    () =>
      adminApi.workflow.getTemplateById(id ?? "") as unknown as Promise<WorkflowTemplateDetailsResponse>,
    Boolean(id)
  );

  const template = useMemo(() => normalizeTemplate(query.data?.data ?? null), [query.data?.data]);

  return {
    template,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
