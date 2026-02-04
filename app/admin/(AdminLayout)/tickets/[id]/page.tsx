"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Group, Text, Title, Button, Menu, Divider } from "@mantine/core";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import IncidentUpdatesOverlay from "@/app/admin/_components/IncidentUpdatesOverlay";
import AssignIncidentModal from "../_ticketsComponents/AssignIncidentModal";
import ChangeStatusModal, { type TicketStatusOption } from "../_ticketsComponents/ChangeStatusModal";
import { adminRoutes } from "@/lib/adminRoutes";
import { Download } from "lucide-react";

const MOCK_TICKET = {
  customerName: "Eddy Ubong",
  dateCreated: "Nov 17 2025",
  timeCreated: "11:00am",
  status: "Active" as const,
  incidentId: "2223334355",
  category: "Transaction dispute",
  priority: "High" as const,
  docName: "Doc.pdf",
  customerEmail: "eddy@example.com",
  customerPhone: "+234 90 4747 2791",
  description:
    "A customer has reported a dispute regarding a recent transaction. They claim that the amount charged does not match their records, and they are seeking immediate resolution. This issue requires urgent attention to ensure customer satisfaction and trust.",
};

export default function ViewTicketPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [updatesOverlayOpen, setUpdatesOverlayOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [changeStatusOpen, setChangeStatusOpen] = useState(false);
  const [ticketStatus, setTicketStatus] = useState<string>(MOCK_TICKET.status);

  const ticket = MOCK_TICKET;

  const handleAssignIncident = () => setAssignModalOpen(true);
  const handleUpdate = () => router.push(adminRoutes.adminTicketUpdate(id));
  const handleChangeStatus = () => setChangeStatusOpen(true);

  const handleStatusSelect = (status: TicketStatusOption) => {
    setTicketStatus(status);
  };

  return (
    <div className="w-full mx-auto">
      <Card radius="lg" p="xl" className="bg-white shadow-sm">
        {/* Header */}
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Title order={3} className="text-gray-900 font-bold! text-2xl!" mb={"sm"}>
              {ticket.customerName}
            </Title>
            <Group gap="xs" mt={4} align="center">
              <Text size="sm" c="dimmed">
                Date Created: {ticket.dateCreated} | {ticket.timeCreated}
              </Text>
              <StatusBadge status={ticketStatus} size="sm" />
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
            <DetailItem label="Incident ID" value={ticket.incidentId} />
            <DetailItem label="Category" value={ticket.category} />
            <div className="space-y-1">
              <Text size="xs" className="text-body-text-50!" mb={4}>
                Priority
              </Text>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden />
                <Text fw={500} size="sm" className="text-red-600">
                  {ticket.priority}
                </Text>
              </div>
            </div>
            <div className="space-y-1">
              <Text size="xs" className="text-body-text-50!" mb={4}>
                Doc
              </Text>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 underline hover:text-orange-600"
              >
                {ticket.docName}
                <Download size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* Customer Details */}
        <section className="space-y-4 mb-8">
          <Text fw={500} className="text-orange-500! text-lg! mb-4!">
            Customer Details
          </Text>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Customer" value={ticket.customerName} />
            <DetailItem label="Email Address" value={ticket.customerEmail} />
            <DetailItem label="Phone Number" value={ticket.customerPhone} />
          </div>
        </section>

        {/* Description */}
        <section className="space-y-4">
          <Text fw={500} className="text-orange-500! text-lg! mb-4!">
            Description
          </Text>
          <Text size="sm" className="text-gray-700 leading-relaxed">
            {ticket.description}
          </Text>
        </section>
      </Card>

      <IncidentUpdatesOverlay
        opened={updatesOverlayOpen}
        onClose={() => setUpdatesOverlayOpen(false)}
        title="Incident Action Type Title"
        description="A one line short context text is here to describe"
        ticketId={id}
      />

      <AssignIncidentModal
        opened={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
      />

      <ChangeStatusModal
        opened={changeStatusOpen}
        onClose={() => setChangeStatusOpen(false)}
        onSelect={handleStatusSelect}
      />
    </div>
  );
}
