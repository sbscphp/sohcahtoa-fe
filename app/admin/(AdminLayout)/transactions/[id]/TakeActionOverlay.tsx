"use client";

import {
  Drawer,
  Group,
  Text,
  Title,
  Button,
  Avatar,
  Tabs,
} from "@mantine/core";
import Connector from "../../../_components/assets/Connector.png";
import Image from "next/image";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";
import { ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";
import React from "react";
import { useState } from "react";

interface WorkflowUser {
  name: string;
  role: string;
  status:
    | "Review Pending"
    | "Approval Pending"
    | "Review Completed"
    | "Rejected";
  initials: string;
  color: string;
  date: string;
  time: string;
  comment: string;
}
interface DocumentItem {
  title: string;
  size: string;
}

interface DocumentationUser {
  name: string;
  role: string;
  initials: string;
  color: string;
  documents: DocumentItem[];
}

const workflowUsers: WorkflowUser[] = [
  {
    name: "Sodiq Olajide",
    role: "Lead of Internal Control",
    status: "Review Completed",
    initials: "BC",
    color: "#F5B89C",
    date: "April 11",
    time: "11:00 am",
    comment:
      "This is the comment box, and it very long and it can be very long like this, but only collect the insight of the admin person, as inputted when they completed their action",
  },
  {
    name: "Moshood Aremu",
    role: "Finance Manager",
    status: "Review Completed",
    initials: "MA",
    color: "#F5B89C",
    date: "April 11",
    time: "11:00 am",
    comment:
      "This is the comment box, and it very long and it can be very long like this, but only collect the insight of the admin person, as inputted when they completed their action",
  },
  {
    name: "Jide Jadeosola",
    role: "Head of Settlement",
    status: "Rejected",
    initials: "JI",
    color: "#A6F4C5",
    date: "April 11",
    time: "11:00 am",
    comment:
      "This is the comment box, for when the action approval (line) was rejected",
  },
];

const documentationUsers: DocumentationUser[] = [
  {
    name: "Moshood Aremu",
    role: "Finance Manager",
    initials: "MA",
    color: "#F97316",
    documents: [],
  },
  {
    name: "Kofoworola Hameed",
    role: "Head of Settlement",
    initials: "JI",
    color: "#22C55E",
    documents: [
      { title: "Return Visa", size: "100 KB" },
      { title: "FX Transaction Receipt", size: "100 KB" },
      { title: "BTA Document Issued by CBN", size: "100 KB" },
      { title: "My passport", size: "100 KB" },
    ],
  },
];

interface TakeActionOverlayProps {
  opened: boolean;
  onClose: () => void;
}

export default function TakeActionOverlay({
  opened,
  onClose,
}: TakeActionOverlayProps) {
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const toggleUserExpansion = (userName: string) => {
    setExpandedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userName)) {
        newSet.delete(userName);
      } else {
        newSet.add(userName);
      }
      return newSet;
    });
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={480}
      withCloseButton={false}
      overlayProps={{ opacity: 0.55, blur: 2 }}
      // styles={{
      //   body: {
      //     display: "flex",
      //     flexDirection: "column",
      //     height: "100%",
      //     paddingBottom: 0,
      //   },
      // }}
    >
      {/* Header */}
      <div className="space-y-1 mb-3">
        <Title order={4} className="text-body-heading-300 font-bold! text-xl!">
          <span className="text-body-text-50!">Request: </span>
          Transaction Review and Approval
        </Title>
        <Text size="sm" className="text-body-text-50!">
          Take action on transactions
        </Text>
      </div>

      {/* Tabs */}
      <Tabs
        color="orange"
        defaultValue="overview"
        className="flex flex-col flex-1 min-h-0 rounded-lg overflow-hidden"
      >
        <Tabs.List className="border-b border-[#EAECF0] px-1 pt-1">
          <AdminTabButton value="overview">
            Workflow Line
          </AdminTabButton>
          <AdminTabButton value="receipt">
            Documentation
          </AdminTabButton>
        </Tabs.List>

        <Tabs.Panel value="overview" className="flex-1 overflow-y-auto pb-4 pt-4">
          <div className="space-y-5">
            {workflowUsers.map((user, index) => (
              <React.Fragment key={index}>
                <div className="bg-[#F7F7F7] rounded-lg p-5 mb-0 space-y-4!">
                  {/* Header Row */}
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Group align="flex-start" gap="sm" wrap="nowrap">
                      <Avatar radius="xl" size="md" color={user.color}>
                        {user.initials}
                      </Avatar>

                      <div className="min-w-0 space-y-1">
                        <Text fw={500} className="text-body-heading-300">
                          {user.name}
                        </Text>
                        <Text size="xs" c="dimmed" className="text-body-text-50!">
                          {user.role}
                        </Text>

                        {/* Date & Time */}
                        <Group gap={6} mt={4}>
                          <Text size="xs" c="dimmed" className="text-body-text-200 border-r border-[#E1E0E0] pr-3">
                            📅 {user.date}
                          </Text>
                          <Text size="xs" c="dimmed" className="text-body-text-200">
                            ⏰ {user.time}
                          </Text>
                        </Group>
                      </div>
                    </Group>

                    {/* Status */}
                    <div className="text-right shrink-0">
                      <StatusBadge status={user.status} size="xs" />
                      <Text size="xs" c="dimmed" className="text-body-text-50! block mt-1">
                        Action Taken
                      </Text>
                    </div>
                  </Group>

                  {/* Comment Box */}
                  <div className="bg-white border border-[#E1E0E0] rounded-lg p-4">
                    <Text size="xs" className="text-body-text-200 leading-relaxed">
                      {user.comment}
                    </Text>
                  </div>
                </div>

                {/* Connector */}
                {index < workflowUsers.length - 1 && (
                  <Image src={Connector} alt="connector" className="ml-8 -my-0.5" />
                )}
              </React.Fragment>
            ))}
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="receipt" className="flex-1 overflow-y-auto pb-32 pt-4">
          <div className="space-y-6">
            {documentationUsers.map((user, index) => (
              <div key={index} className="space-y-4">
                {/* User Header */}
                <Group className="bg-[#F7F7F7] p-4 rounded-lg" gap="sm">
                  <Avatar radius="xl" size="md" color={user.color}>
                    {user.initials}
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <Text fw={500} className="text-body-heading-300">
                      {user.name}
                    </Text>
                    <Text size="xs" c="dimmed" className="text-body-text-50!">
                      {user.role}
                    </Text>
                  </div>
                </Group>

                {/* Documents Header */}
                <Group
                  justify="space-between"
                  className="bg-[#FBE6D9] px-4 py-3 rounded-lg cursor-pointer border border-[#FBE6D9] hover:bg-[#F9DDCE] transition-colors"
                  onClick={() => toggleUserExpansion(user.name)}
                >
                  <Text size="sm" fw={500} className="text-primary-400">
                    {user.documents.length} Documents
                  </Text>

                  <span className="text-primary-400">
                    {expandedUsers.has(user.name) ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </span>
                </Group>

                {/* Documents List */}
                {expandedUsers.has(user.name) && user.documents.length > 0 && (
                  <div className="rounded-lg border border-[#E1E0E0] overflow-hidden divide-y divide-[#E1E0E0]">
                    {user.documents.map((doc, docIndex) => (
                      <Group
                        key={docIndex}
                        justify="space-between"
                        className="px-4 py-3 bg-white"
                        wrap="nowrap"
                      >
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <Text size="sm" fw={500} className="text-body-heading-300">
                            {doc.title}
                          </Text>
                          <Text size="xs" c="dimmed" className="text-body-text-50!">
                            {doc.size}
                          </Text>

                          <Text
                            size="xs"
                            className="cursor-pointer flex items-center gap-1 underline text-body-text-200 hover:text-primary-400 mt-2"
                          >
                            View Document{" "}
                            <ArrowUpRight size={14} className="text-primary-400" />
                          </Text>
                        </div>

                        <div className="text-right flex flex-col items-end gap-3 shrink-0">
                          <StatusBadge
                            variant="light"
                            radius="xl"
                            bg="#F2F4F7"
                            color="#344054"
                            status="No Action"
                          />

                          <Text
                            size="xs"
                            className="cursor-pointer underline flex items-center gap-1 text-body-text-200 hover:text-primary-400"
                          >
                            Take Action{" "}
                            <ChevronDown size={14} className="text-primary-400" />
                          </Text>
                        </div>
                      </Group>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Tabs.Panel>
      </Tabs>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 left-0 right-0 z-10 py-5 px-4 -mx-4 -mb-4 mt-auto border-t border-[#E1E0E0] bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <Group justify="center" gap="md">
          <Button color="#DD4F05" radius="xl" size="lg" className="font-medium! text-sm!">
            Complete Review
          </Button>
          <Button variant="outline" radius="xl" size="lg" color="dark" className="font-medium! text-sm!">
            Request More Info
          </Button>
        </Group>
      </div>
    </Drawer>
  );
}
