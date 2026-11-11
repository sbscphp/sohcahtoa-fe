"use client";

import { useMemo } from "react";
import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import {
  adminApi,
  type FxInventoryDisbursementStatus,
} from "@/app/admin/_services/admin-api";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";

const STATUS_LABELS: Record<FxInventoryDisbursementStatus, string> = {
  PENDING_APPROVAL: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
};

export type DisbursementStageState = "pending" | "approved" | "rejected";

export interface DisbursementStageCard {
  id: string;
  stageName: string;
  order: number;
  isCurrent: boolean;
  state: DisbursementStageState;
  /** Pending stage that will not be reached because an earlier stage was rejected. */
  isStale: boolean;
  actorName: string;
  actorRole: string;
  date: string;
  time: string;
  comment: string;
}

export interface DisbursementActivityCard {
  id: string;
  actorName: string;
  actorRole: string;
  title: string;
  outcomeLabel: string;
  date: string;
  time: string;
  comment: string;
}

export interface FxInventoryDisbursementDetailView {
  id: string;
  reference: string;
  agentName: string;
  agentId: string;
  requestedDate: string;
  requestedTime: string;
  currency: string;
  amountLabel: string;
  requestor: string;
  workflowStageLabel: string;
  statusLabel: string;
  rawStatus: string;
  purpose: string;
  inventoryValueLabel: string;
  amountAfterLabel: string;
  processName: string;
  approvalState: string;
  stages: DisbursementStageCard[];
  activities: DisbursementActivityCard[];
  canAct: boolean;
}

interface DisbursementApprovalResponse {
  data?: unknown;
}

type UnknownRecord = Record<string, unknown>;

function asString(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  return typeof value === "string" ? value : String(value);
}

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function asRecordArray(value: unknown): UnknownRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is UnknownRecord => typeof item === "object" && item !== null
  );
}

function toAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatAmount(amount: number | null, currency: string): string {
  if (amount === null) return "-";
  return formatCurrency(amount, currency || "NGN") || "-";
}

function formatDateTime(iso: string): { date: string; time: string } {
  if (!iso) return { date: "--", time: "--" };

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return { date: "--", time: "--" };

  return {
    date: parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: parsed.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

function toTimestampMs(iso: string): number {
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toTitleCase(value: string): string {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusLabel(status: string): string {
  const normalized = status.trim().toUpperCase() as FxInventoryDisbursementStatus;
  return STATUS_LABELS[normalized] ?? (toTitleCase(status) || "--");
}

function pickAssigneeId(assignee: UnknownRecord): string | null {
  const value = assignee.adminId ?? assignee.id ?? assignee.userId;
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function stageDecision(action: string): "approved" | "rejected" | null {
  const normalized = action.trim().toUpperCase();
  if (normalized.endsWith("APPROVED")) return "approved";
  if (normalized.endsWith("REJECTED")) return "rejected";
  return null;
}

interface ParsedWorkflowEntry {
  record: UnknownRecord;
  timestampMs: number;
  decision: "approved" | "rejected" | null;
}

function buildStages(
  stageRecords: UnknownRecord[],
  decisions: ParsedWorkflowEntry[]
): DisbursementStageCard[] {
  const sortedStages = stageRecords
    .slice()
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  let rejectedSeen = false;

  return sortedStages.map((stage, index) => {
    const decision = decisions[index];
    const stageName = asString(stage.name, "Stage");
    const order = Number(stage.order) || index + 1;
    const isCurrent = stage.isCurrent === true;

    if (decision?.decision) {
      const record = decision.record;
      const { date, time } = formatDateTime(asString(record.timestamp));
      if (decision.decision === "rejected") rejectedSeen = true;
      return {
        id: asString(stage.stageId) || `stage-${index}`,
        stageName,
        order,
        isCurrent,
        state: decision.decision,
        isStale: false,
        actorName: asString(record.adminName, "--"),
        actorRole: asString(record.adminRole),
        date,
        time,
        comment: asString(record.comment).trim(),
      };
    }

    const firstAssignee = asRecordArray(stage.assignees)[0];

    return {
      id: asString(stage.stageId) || `stage-${index}`,
      stageName,
      order,
      isCurrent,
      state: "pending",
      isStale: rejectedSeen,
      actorName: asString(firstAssignee?.adminName, "Unassigned"),
      actorRole: asString(firstAssignee?.roleName),
      date: "--",
      time: "--",
      comment: "",
    };
  });
}

function buildActivities(entries: ParsedWorkflowEntry[]): DisbursementActivityCard[] {
  return entries.map(({ record }, index) => {
    const { date, time } = formatDateTime(asString(record.timestamp));
    const outcome = asString(record.outcome).trim();
    const action = asString(record.action).trim();

    return {
      id: asString(record.id) || `activity-${index}`,
      actorName: asString(record.adminName, "--"),
      actorRole: asString(record.adminRole),
      title: asString(record.title).trim() || toTitleCase(action) || "Activity",
      outcomeLabel: outcome || toTitleCase(action) || "--",
      date,
      time,
      comment: asString(record.comment).trim(),
    };
  });
}

function parseDetail(
  data: unknown,
  adminUserId?: string
): FxInventoryDisbursementDetailView | null {
  const raw = asRecord(data);
  if (!raw) return null;

  const id = asString(raw.id);
  if (!id) return null;

  const agent = asRecord(raw.agent);
  const initiator = asRecord(raw.initiator);
  const approvalProcess = asRecord(raw.approvalProcess);
  const currency = asString(raw.currency, "NGN");
  const requested = formatDateTime(asString(raw.requestedAt));
  const rawStatus = asString(raw.status).trim().toUpperCase();

  const stageRecords = asRecordArray(approvalProcess?.workflowStages);

  const workflowEntries: ParsedWorkflowEntry[] = asRecordArray(raw.workflowLine)
    .map((record) => ({
      record,
      timestampMs: toTimestampMs(asString(record.timestamp)),
      decision: stageDecision(asString(record.action)),
    }))
    .sort((a, b) => a.timestampMs - b.timestampMs);

  const decisionEntries = workflowEntries.filter((entry) => entry.decision !== null);
  const stageDecisions = decisionEntries.slice(0, stageRecords.length);
  const overflowDecisions = decisionEntries.slice(stageRecords.length);
  const activityEntries = [
    ...workflowEntries.filter((entry) => entry.decision === null),
    ...overflowDecisions,
  ].sort((a, b) => a.timestampMs - b.timestampMs);

  const currentStage = stageRecords.find((stage) => stage.isCurrent === true);
  const currentAssigneeIds = new Set<string>();
  for (const assignee of asRecordArray(currentStage?.assignees)) {
    const assigneeId = pickAssigneeId(assignee);
    if (assigneeId) currentAssigneeIds.add(assigneeId);
  }
  const uid = adminUserId?.trim();
  const canAct =
    rawStatus === "PENDING_APPROVAL" &&
    approvalProcess?.isApprovalOfficer === true &&
    Boolean(uid) &&
    currentAssigneeIds.has(uid as string);

  const approvalState = asString(approvalProcess?.approvalState).trim();

  return {
    id,
    reference: asString(raw.referenceNumber, "--"),
    agentName: asString(agent?.name, "--"),
    agentId: asString(agent?.id, "--"),
    requestedDate: requested.date,
    requestedTime: requested.time,
    currency,
    amountLabel: formatAmount(toAmount(raw.amount), currency),
    requestor: asString(initiator?.name, "--"),
    workflowStageLabel: approvalState || "--",
    statusLabel: statusLabel(rawStatus),
    rawStatus,
    purpose: asString(raw.purpose).trim() || "--",
    inventoryValueLabel: formatAmount(toAmount(raw.currentInventoryBalance), currency),
    amountAfterLabel: formatAmount(toAmount(raw.balanceAfterDisbursement), currency),
    processName: asString(approvalProcess?.name).trim(),
    approvalState,
    stages: buildStages(stageRecords, stageDecisions),
    activities: buildActivities(activityEntries),
    canAct,
  };
}

export function useFxInventoryDisbursement(
  id?: string,
  options?: { adminUserId?: string }
) {
  const query = useFetchSingleData<DisbursementApprovalResponse>(
    [...adminKeys.fxInventory.disbursement(id ?? "")],
    () =>
      adminApi.fxInventory.getDisbursementApproval(
        id ?? ""
      ) as unknown as Promise<DisbursementApprovalResponse>,
    Boolean(id)
  );

  const adminUserId = options?.adminUserId;
  const detail = useMemo(
    () => parseDetail(query.data?.data, adminUserId),
    [query.data?.data, adminUserId]
  );

  return {
    detail,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
}
