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
  editTemplate: WorkflowTemplateEditData;
}

export interface WorkflowTemplateEditAssignee {
  id: string;
  name: string;
}

export interface WorkflowTemplateEditStage {
  id: string;
  name: string;
  type: "REVIEW" | "APPROVAL" | "DOCUMENTATION" | "VERIFICATION";
  order: number;
  escalationMinutes: number;
  assignees: WorkflowTemplateEditAssignee[];
}

export interface WorkflowTemplateEditData {
  id: string;
  name: string;
  description: string;
  type: "REVIEW" | "APPROVAL";
  processType: "RIGID_LINEAR" | "FLEXIBLE";
  action: string;
  status: "ACTIVE" | "DEACTIVATED" | "DRAFT";
  escalationMinutes: number;
  hasPtaRequest: boolean;
  branchId: string;
  departmentId: string;
  stages: WorkflowTemplateEditStage[];
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

function mapAssigneeToUser(
  adminId: string,
  stageType: string,
  adminName?: string,
  roleName?: string
): ViewUser {
  const displayName = adminName || `Admin ${adminId.slice(0, 8).toUpperCase()}`;
  const roleLabel = roleName ? toTitleCase(roleName) : toTitleCase(stageType) || "User";

  return {
    id: adminId,
    name: displayName,
    email: "--",
    roles: [roleLabel],
  };
}

function mapStageToViewLine(stage: WorkflowTemplateStage): ViewWorkflowLine {
  return {
    id: stage.id,
    workflowType: toTitleCase(asString(stage.type, "Review")),
    escalationPeriod: Number.isFinite(stage.escalationMinutes) ? stage.escalationMinutes : 0,
    escalateToName: "--",
    users: (stage.assignees ?? []).map((assignee) =>
      mapAssigneeToUser(assignee.adminId, stage.type, assignee.adminName, assignee.roleName)
    ),
  };
}

function mapStageForEdit(stage: WorkflowTemplateStage): WorkflowTemplateEditStage {
  const normalizedType = asString(stage.type, "REVIEW").toUpperCase();

  return {
    id: asString(stage.id),
    name: asString(stage.name, ""),
    type:
      normalizedType === "APPROVAL" ||
      normalizedType === "DOCUMENTATION" ||
      normalizedType === "VERIFICATION"
        ? normalizedType
        : "REVIEW",
    order: Number.isFinite(stage.order) ? stage.order : 0,
    escalationMinutes: Number.isFinite(stage.escalationMinutes) ? stage.escalationMinutes : 0,
    assignees: (stage.assignees ?? [])
      .map((assignee) => ({
        id: asString(assignee.adminId),
        name: asString(assignee.adminName, `Admin ${asString(assignee.adminId).slice(0, 8).toUpperCase()}`),
      }))
      .filter((a) => Boolean(a.id)),
  };
}

function normalizeTemplate(data: WorkflowTemplateDetailsData | null): WorkflowTemplateDetailsViewModel | null {
  if (!data) return null;

  const sourceWithDate = data as unknown as Record<string, unknown>;
  const createdAtCandidate =
    asString(sourceWithDate.createdAt) ||
    asString(sourceWithDate.updatedAt) ||
    asString(sourceWithDate.dateCreated);
  const stages = [...(data.stages ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const normalizedType = asString(data.type, "REVIEW").toUpperCase();
  const normalizedProcessType = asString(data.processType, "RIGID_LINEAR").toUpperCase();
  const normalizedStatus = asString(data.status, "ACTIVE").toUpperCase();

  return {
    id: asString(data.id),
    name: asString(data.name, "--"),
    dateCreated: formatDate(createdAtCandidate),
    timeCreated: formatTime(createdAtCandidate),
    status: mapStatus(data.status),
    workflowAction: asString(data.action, "--"),
    description: asString(data.description, "--"),
    branch: asString(
      // Prefer human-readable branch name when available
      (data as WorkflowTemplateDetailsData).branchName ??
        (sourceWithDate.branchName as string | undefined) ??
        data.branchId,
      "--"
    ),
    department: asString(
      // Prefer human-readable department name when available
      (data as WorkflowTemplateDetailsData).departmentName ??
        (sourceWithDate.departmentName as string | undefined) ??
        data.departmentId,
      "--"
    ),
    workflowType: toTitleCase(asString(data.processType, "--")),
    personnelProcesses: stages.map(mapStageToViewLine),
    editTemplate: {
      id: asString(data.id),
      name: asString(data.name),
      description: asString(data.description),
      type: normalizedType === "APPROVAL" ? "APPROVAL" : "REVIEW",
      processType: normalizedProcessType === "FLEXIBLE" ? "FLEXIBLE" : "RIGID_LINEAR",
      action: asString(data.action),
      status:
        normalizedStatus === "DEACTIVATED"
          ? "DEACTIVATED"
          : normalizedStatus === "DRAFT"
            ? "DRAFT"
            : "ACTIVE",
      escalationMinutes: Number.isFinite(data.escalationMinutes) ? data.escalationMinutes : 0,
      hasPtaRequest: Boolean(data.hasPtaRequest),
      branchId: asString(data.branchId),
      departmentId: asString(data.departmentId),
      stages: stages.map(mapStageForEdit),
    },
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
