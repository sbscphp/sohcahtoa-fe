"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Group, Text, Title, Button, Menu, Divider, Skeleton } from "@mantine/core";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import IncidentUpdatesOverlay from "@/app/admin/_components/IncidentUpdatesOverlay";
import Communication from "@/app/admin/_components/Communication";
import CommentNoteModal from "@/app/admin/_components/CommentNoteModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import AssignIncidentModal from "../_ticketsComponents/AssignIncidentModal";
import ChangeStatusModal, {
  type TicketStatusSelection,
} from "../_ticketsComponents/ChangeStatusModal";
import { adminRoutes } from "@/lib/adminRoutes";
import { Download } from "lucide-react";
import { useTicketDetails } from "../hooks/useTicketDetails";
import { useCreateData } from "@/app/_lib/api/hooks";
import { adminApi } from "@/app/admin/_services/admin-api";
import { notifications } from "@mantine/notifications";
import { type ApiError, type ApiResponse } from "@/app/_lib/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/app/_lib/api/query-keys";
import type { TicketStatusCode } from "@/app/admin/_services/admin-api";

function formatStatusLabel(status: TicketStatusCode): string {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export default function ViewTicketPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string;
  const { ticket, isLoading } = useTicketDetails(id);

  const [updatesOverlayOpen, setUpdatesOverlayOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [changeStatusOpen, setChangeStatusOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteModalMode, setNoteModalMode] = useState<"comment" | "resolve">(
    "comment"
  );
  const [resolveSuccessOpen, setResolveSuccessOpen] = useState(false);
  const [ticketStatus, setTicketStatus] = useState<string | null>(null);

  const updateStatusMutation = useCreateData(
    (variables: TicketStatusSelection) =>
      adminApi.tickets.updateStatus(id, {
        status: variables.status,
        notes: variables.notes,
      }),
    {
      onSuccess: async (_response, variables) => {
        setTicketStatus(formatStatusLabel(variables.status));
        setChangeStatusOpen(false);

        notifications.show({
          title: "Status Updated",
          message: "Ticket status was updated successfully.",
          color: "green",
        });

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.tickets.detail(id)],
          }),
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.tickets.all],
          }),
        ]);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;

        notifications.show({
          title: "Update Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to update ticket status. Please try again.",
          color: "red",
        });
      },
    }
  );
  const addCommentMutation = useCreateData(
    (message: string) => adminApi.tickets.addComment(id, { message }),
    {
      onSuccess: async () => {
        setNoteModalOpen(false);
        notifications.show({
          title: "Comment Added",
          message: "Comment posted successfully.",
          color: "green",
        });
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.tickets.comments(id)],
          }),
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.tickets.detail(id)],
          }),
        ]);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Add Comment Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to post comment. Please try again.",
          color: "red",
        });
      },
    }
  );
  const resolveIncidentMutation = useCreateData(
    (message: string) =>
      adminApi.tickets.updateStatus(id, {
        status: "CLOSED",
        notes: message,
      }),
    {
      onSuccess: async () => {
        setTicketStatus("Closed");
        setNoteModalOpen(false);
        setResolveSuccessOpen(true);

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.tickets.detail(id)],
          }),
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.tickets.all],
          }),
          queryClient.invalidateQueries({
            queryKey: [...adminKeys.tickets.stats()],
          }),
        ]);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Resolve Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to resolve incident. Please try again.",
          color: "red",
        });
      },
    }
  );

  const handleAssignIncident = () => setAssignModalOpen(true);
  const handleUpdate = () => router.push(adminRoutes.adminTicketUpdate(id));
  const handleChangeStatus = () => setChangeStatusOpen(true);
  const handleOverlayAddComment = () => {
    setUpdatesOverlayOpen(false);
    setNoteModalMode("comment");
    setNoteModalOpen(true);
  };
  const handleOverlayResolve = () => {
    setUpdatesOverlayOpen(false);
    setNoteModalMode("resolve");
    setNoteModalOpen(true);
  };
  const handleNoteSubmit = (message: string) => {
    if (noteModalMode === "resolve") {
      resolveIncidentMutation.mutate(message);
      return;
    }

    addCommentMutation.mutate(message);
  };
  const handleCloseSuccess = () => {
    setResolveSuccessOpen(false);
  };

  const handleStatusSelect = (selection: TicketStatusSelection) => {
    updateStatusMutation.mutate(selection);
  };

  const attachmentName = ticket?.firstAttachment?.fileName?.trim()
    ? ticket.firstAttachment.fileName
    : ticket?.firstAttachment?.fileUrl
      ? ticket.firstAttachment.fileUrl.split("/").pop() || "Attachment"
      : "--";
  const displayedStatus = ticketStatus ?? ticket?.statusLabel ?? "--";

  return (
    <div className="w-full mx-auto">
      <Card radius="lg" p="xl" className="bg-white shadow-sm">
        {/* Header */}
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Title order={3} className="text-gray-900 font-bold! text-2xl!" mb={"sm"}>
              {isLoading ? <Skeleton height={28} width={220} /> : ticket?.customerName ?? "--"}
            </Title>
            <Group gap="xs" mt={4} align="center">
              {isLoading ? (
                <Skeleton height={16} width={200} />
              ) : (
                <Text size="sm" c="dimmed">
                  Date Created: {ticket?.createdDate ?? "--"} | {ticket?.createdTime ?? "--"}
                </Text>
              )}
              {isLoading ? (
                <Skeleton height={22} width={90} radius="xl" />
              ) : (
                <StatusBadge status={displayedStatus} size="sm" />
              )}
            </Group>
          </div>

          <Group gap="sm">
            <Button
              variant="outline"
              color="gray"
              radius="xl"
              size="md"
              onClick={() => setUpdatesOverlayOpen(true)}
            >
              View Updates
            </Button>
            <Menu position="bottom-end" shadow="md" width={200}>
              <Menu.Target>
                <Button radius="xl" size="md" color="#DD4F05">
                  Take Action
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={handleAssignIncident}>
                  Assign Incident
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item onClick={handleUpdate}>Update</Menu.Item>
                <Menu.Divider />
                <Menu.Item onClick={handleChangeStatus}>
                  Change Status
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        <Divider my="xl"/>

        {/* Ticket Summary */}
        <section className="space-y-4 mb-8">
          <Text fw={500} className="text-orange-500! text-lg! mb-4!">
            Ticket Summary
          </Text>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Incident ID" value={isLoading ? "..." : ticket?.reference ?? "--"} />
            <DetailItem label="Category" value={isLoading ? "..." : ticket?.caseType ?? "--"} />
            <div className="space-y-1">
              <Text size="xs" className="text-body-text-50!" mb={4}>
                Priority
              </Text>
              {isLoading ? (
                <Skeleton height={18} width={90} />
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden />
                  <Text fw={500} size="sm" className="text-red-600">
                    {ticket?.priorityLabel ?? "--"}
                  </Text>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Text size="xs" className="text-body-text-50!" mb={4}>
                Doc
              </Text>
              {isLoading ? (
                <Skeleton height={18} width={100} />
              ) : ticket?.firstAttachment?.fileUrl ? (
                <a
                  href={ticket.firstAttachment.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 underline hover:text-orange-600"
                >
                  {attachmentName}
                  <Download size={14} />
                </a>
              ) : (
                <Text size="sm">--</Text>
              )}
            </div>
          </div>
        </section>

        {/* Customer Details */}
        <section className="space-y-4 mb-8">
          <Text fw={500} className="text-orange-500! text-lg! mb-4!">
            Customer Details
          </Text>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Customer" value={isLoading ? "..." : ticket?.customerName ?? "--"} />
            <DetailItem label="Email Address" value={isLoading ? "..." : ticket?.customerEmail ?? "--"} />
            <DetailItem
              label="Phone Number"
              value={isLoading ? "..." : ticket?.customerPhoneNumber ?? "--"}
            />
          </div>
        </section>

        {/* Description */}
        <section className="space-y-4">
          <Text fw={500} className="text-orange-500! text-lg! mb-4!">
            Description
          </Text>
          {isLoading ? (
            <Skeleton height={72} />
          ) : (
            <Text size="sm" className="text-gray-700 leading-relaxed">
              {ticket?.description ?? "--"}
            </Text>
          )}
        </section>
      </Card>

      <Communication entityId={id} />

      <IncidentUpdatesOverlay
        opened={updatesOverlayOpen}
        onClose={() => setUpdatesOverlayOpen(false)}
        title={ticket?.caseType ?? "--"}
        description={ticket?.description ?? "--"}
        ticketId={id}
        attachment={{
          fileUrl: ticket?.firstAttachment?.fileUrl ?? null,
          fileName: ticket?.firstAttachment?.fileName ?? null,
          fileSize: ticket?.firstAttachment?.fileSize ?? null,
          uploadedBy: "Customer",
        }}
        onAddComment={handleOverlayAddComment}
        onResolve={handleOverlayResolve}
        actionLoading={
          addCommentMutation.isPending || resolveIncidentMutation.isPending
        }
      />

      <AssignIncidentModal
        opened={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
      />

      <ChangeStatusModal
        opened={changeStatusOpen}
        onClose={() => setChangeStatusOpen(false)}
        onSelect={handleStatusSelect}
        loading={updateStatusMutation.isPending}
        currentStatus={ticket?.statusCode ?? null}
      />

      <CommentNoteModal
        opened={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onSubmit={handleNoteSubmit}
        loading={
          noteModalMode === "resolve"
            ? resolveIncidentMutation.isPending
            : addCommentMutation.isPending
        }
        title="Leave comment"
        placeholder="Write comment here"
        submitLabel={noteModalMode === "resolve" ? "Resolve Incident" : "Post Note"}
      />

      <SuccessModal
        opened={resolveSuccessOpen}
        onClose={handleCloseSuccess}
        title="Incident Resolved"
        message="Incident has been resolved successfully."
        primaryButtonText="Close"
        onPrimaryClick={handleCloseSuccess}
      />
    </div>
  );
}
