"use client";

import { useState } from "react";
import { Button, Drawer, Modal, Tabs, Textarea } from "@mantine/core";
import { Calendar, Clock } from "lucide-react";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import type { DisbursementStatus } from "../_data/fxInventoryMock";

type StageKind = "review" | "approval";
type StageState = "pending" | "completed" | "rejected";

interface WorkflowStage {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarClass: string;
  kind: StageKind;
  state: StageState;
  comment?: string;
  actedAt?: string;
}

const STAGE_TEMPLATES: Array<Omit<WorkflowStage, "state" | "comment" | "actedAt">> = [
  {
    id: "sodiq",
    name: "Sodiq Olajide",
    role: "Lead of Internal Control",
    initials: "SO",
    avatarClass: "bg-primary-25 text-primary-500",
    kind: "review",
  },
  {
    id: "moshood",
    name: "Moshood Aremu",
    role: "Finance Manager",
    initials: "MA",
    avatarClass: "bg-orange-100 text-orange-700",
    kind: "review",
  },
  {
    id: "jide",
    name: "Jide Jadeosola",
    role: "Head of Settlement",
    initials: "JJ",
    avatarClass: "bg-green-100 text-green-700",
    kind: "approval",
  },
];

const COMPLETED_COMMENT =
  "This is the comment box, and it very long and it can be very long like this, but only collect the insight of the admin person, as inputted when they completed their action";
const COMPLETED_ACTED_AT = "April 11, 11:00 am";

const STATUS_COLOR: Record<StageState, string> = {
  pending: "#B54708",
  completed: "#027A48",
  rejected: "#B42318",
};

function stageLabel(stage: WorkflowStage) {
  if (stage.state === "rejected") return "Rejected";
  if (stage.state === "completed") {
    return stage.kind === "approval" ? "Approval Completed" : "Review Completed";
  }
  return stage.kind === "approval" ? "Approval Pending" : "Review Pending";
}

function stageSubtitle(stage: WorkflowStage) {
  if (stage.state === "pending") return "Action Required";
  if (stage.state === "completed") return "Action Taken";
  return "Rejected";
}

function buildStages(status: DisbursementStatus): WorkflowStage[] {
  if (status === "Approved") {
    return STAGE_TEMPLATES.map((stage) => ({
      ...stage,
      state: "completed",
      comment: COMPLETED_COMMENT,
      actedAt: COMPLETED_ACTED_AT,
    }));
  }

  if (status === "Rejected") {
    return STAGE_TEMPLATES.map((stage, index) =>
      index === STAGE_TEMPLATES.length - 1
        ? { ...stage, state: "rejected" }
        : {
            ...stage,
            state: "completed",
            comment: COMPLETED_COMMENT,
            actedAt: COMPLETED_ACTED_AT,
          }
    );
  }

  return STAGE_TEMPLATES.map((stage) => ({ ...stage, state: "pending" }));
}

function formatActedAt(date: Date) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface DisbursementTakeActionDrawerProps {
  opened: boolean;
  onClose: () => void;
  status: DisbursementStatus;
}

export default function DisbursementTakeActionDrawer({
  opened,
  onClose,
  status,
}: DisbursementTakeActionDrawerProps) {
  const [stages, setStages] = useState(() => buildStages(status));
  const [commentOpen, setCommentOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [pendingCompletion, setPendingCompletion] = useState<{
    comment: string;
    actedAt: string;
  } | null>(null);

  const hasPendingStage = stages.some((stage) => stage.state === "pending");

  const closeComment = () => {
    setCommentOpen(false);
    setComment("");
    setCommentError("");
  };

  const submitComment = () => {
    const trimmed = comment.trim();
    if (!trimmed) {
      setCommentError("Comment is required");
      return;
    }

    setPendingCompletion({ comment: trimmed, actedAt: formatActedAt(new Date()) });
    closeComment();
    setSuccessOpen(true);
  };

  const applyCompletion = () => {
    if (!pendingCompletion) {
      setSuccessOpen(false);
      return;
    }

    setStages((current) => {
      const nextIndex = current.findIndex((stage) => stage.state === "pending");
      if (nextIndex < 0) return current;
      return current.map((stage, index) =>
        index === nextIndex
          ? {
              ...stage,
              state: "completed",
              comment: pendingCompletion.comment,
              actedAt: pendingCompletion.actedAt,
            }
          : stage
      );
    });

    setPendingCompletion(null);
    setSuccessOpen(false);
  };

  return (
    <>
      <Drawer
        opened={opened}
        onClose={onClose}
        position="right"
        size={480}
        zIndex={300}
        withCloseButton={false}
        overlayProps={{ opacity: 0.45, blur: 2 }}
        classNames={{ body: "h-full p-0" }}
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto px-6 pt-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                <span className="font-medium text-gray-500">Request: </span>
                Disbursement Review and Approval
              </h2>
              <p className="mt-1 text-sm text-gray-500">Take action on disbursement</p>
            </div>

            <Tabs color="orange" value="workflow" className="mt-2">
              <Tabs.List className="mb-4 border-0! before:content-none!">
                <AdminTabButton value="workflow">Workflow Line</AdminTabButton>
              </Tabs.List>

              <Tabs.Panel value="workflow">
                <div className="space-y-0">
                  {stages.map((stage, index) => (
                    <div key={stage.id} className="relative flex gap-3 pb-6">
                      {index < stages.length - 1 ? (
                        <span className="absolute top-10 bottom-0 left-5 border-l border-dashed border-gray-300" />
                      ) : null}
                      <div
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${stage.avatarClass}`}
                      >
                        {stage.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{stage.name}</p>
                            <p className="text-xs text-gray-500">{stage.role}</p>
                          </div>
                          <div className="text-right">
                            <StatusBadge status={stageLabel(stage)} color={STATUS_COLOR[stage.state]} />
                            <p className="mt-1 text-xs text-gray-400">{stageSubtitle(stage)}</p>
                          </div>
                        </div>

                        {stage.state === "completed" && stage.actedAt ? (
                          <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                            <Calendar size={12} />
                            <Clock size={12} />
                            <span>{stage.actedAt}</span>
                          </div>
                        ) : null}

                        {stage.state === "completed" && stage.comment ? (
                          <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                            {stage.comment}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </Tabs.Panel>
            </Tabs>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
            {hasPendingStage ? (
              <CustomButton buttonType="primary" onClick={() => setCommentOpen(true)}>
                Complete Review
              </CustomButton>
            ) : null}
            <Button variant="default" radius="xl" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Drawer>

      <Modal
        opened={commentOpen}
        onClose={closeComment}
        centered
        withCloseButton={false}
        radius="lg"
        padding="xl"
        zIndex={4000}
        overlayProps={{ opacity: 0.3, blur: 2 }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-00 text-2xl text-primary-400">
            !
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">Complete Review ?</h2>
          <p className="mt-2 text-sm text-gray-500">
            You are about to mark this request as reviewed. Once confirmed, your review will be
            submitted and passed on to the next stage for approval
          </p>
        </div>

        <Textarea
          className="mt-5"
          label="Comment"
          withAsterisk
          placeholder="Start Typing"
          minRows={3}
          value={comment}
          error={commentError}
          onChange={(event) => {
            setComment(event.currentTarget.value);
            if (commentError) setCommentError("");
          }}
        />

        <div className="mt-5 space-y-3">
          <Button fullWidth radius="xl" color="orange" onClick={submitComment}>
            Yes, Complete Review
          </Button>
          <Button fullWidth radius="xl" variant="outline" color="gray" onClick={closeComment}>
            No, Close
          </Button>
        </div>
      </Modal>

      <SuccessModal
        opened={successOpen}
        onClose={applyCompletion}
        zIndex={4000}
        title="Review Completed"
        message="The review has been successfully completed and forwarded to the next stage for review or approval"
        primaryButtonText="Close"
        onPrimaryClick={applyCompletion}
      />
    </>
  );
}
