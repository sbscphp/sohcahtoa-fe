"use client";

import {
  Drawer,
  Group,
  Text,
  Title,
  Badge,
  Button,
  Avatar,
  Divider,
  Tabs,
} from "@mantine/core";
import Connector from "../../../_components/assets/Connector.png";
import Image from "next/image";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
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
      "This is the comment box, and it very long and it can be very long like this, but only collect the insight of the admin person, as inputted when they completed their acion",
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
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          height: "100%",
        },
      }}
    >
      {/* Header */}
      <div className="space-y-1">
        <Title order={4}>
          <span className="font-medium text-[#8F8B8B] ">Request: </span>
          Transaction Review and Approval
        </Title>
        <Text size="sm" c="dimmed">
          Take action on transactions
        </Text>
      </div>

      {/* Tabs */}
      <Tabs
        color="orange"
        defaultValue="overview"
        className="border-[#E1E0E0] shadow-[#0B0A0A0D] shadow-[-0_4px_-6px_1px_rgba(0,0,0,0.1)]"
      >
        <Tabs.List className="">
          <Tabs.Tab value="overview">Workflow Line</Tabs.Tab>
          <Tabs.Tab value="receipt">Documentation</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <div className="space-y-6">
            {workflowUsers.map((user, index) => (
              <React.Fragment key={index}>
                <div className="bg-[#F7F7F7] rounded-lg p-4 space-y-3">
                  {/* Header Row */}
                  <Group justify="space-between" align="flex-start">
                    <Group align="flex-start">
                      <Avatar radius="xl" color={user.color}>
                        {user.initials}
                      </Avatar>

                      <div>
                        <Text fw={500}>{user.name}</Text>
                        <Text size="xs" c="dimmed">
                          {user.role}
                        </Text>

                        {/* Date & Time */}
                        <Group gap={6} mt={6}>
                          <Text size="xs" c="dimmed" className="border-r pr-3!">
                            📅 {user.date}
                          </Text>
                          <Text size="xs" c="dimmed">
                            ⏰ {user.time}
                          </Text>
                        </Group>
                      </div>
                    </Group>

                    {/* Status */}
                    <div className="text-right">
                      <StatusBadge status={user.status} />
                      <Text size="xs" c="dimmed">
                        Action Taken
                      </Text>
                    </div>
                  </Group>

                  {/* Comment Box */}
                  <div className="bg-white border border-[#E1E0E0] rounded-md p-3">
                    <Text size="xs" c="#475467">
                      {user.comment}
                    </Text>
                  </div>
                </div>

                {/* Connector */}
                {index < workflowUsers.length - 1 && (
                  <Image src={Connector} alt="connector" className="ml-6 -my-1" />
                )}
              </React.Fragment>
            ))}
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="receipt" className="flex-1 overflow-y-auto pb-32">
          <div className="space-y-6">
            {documentationUsers.map((user, index) => (
              <div key={index} className="space-y-3">
                {/* User Header */}
                <Group className="bg-[#F7F7F7] p-3 rounded-lg">
                  <Avatar radius="xl" color={user.color}>
                    {user.initials}
                  </Avatar>

                  <div className="flex-1">
                    <Text fw={500}>{user.name}</Text>
                    <Text size="xs" c="dimmed">
                      {user.role}
                    </Text>
                  </div>
                </Group>

                {/* Documents Header */}
                <Group
                  justify="space-between"
                  className="bg-[#FBE6D9] px-3 py-2 rounded-md cursor-pointer"
                  onClick={() => toggleUserExpansion(user.name)}
                >
                  <Text size="sm" fw={500} c="#DD4F05">
                    {user.documents.length} Documents
                  </Text>

                  <Text size="xs" c="#DD4F05">
                    {expandedUsers.has(user.name) ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </Text>
                </Group>

                {/* Documents List */}
                {expandedUsers.has(user.name) && (
                  <div className=" rounded-md shadow-[#0B0A0A0D] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-b-[#E1E0E0] ">
                    {user.documents.map((doc, docIndex) => (
                      <Group
                        key={docIndex}
                        justify="space-between"
                        className="px-3 py-2 border-b rounded-2xl border-b-[#E1E0E0]"
                      >
                        <div className="flex flex-col">
                          <Text size="sm">{doc.title}</Text>
                          <Text size="xs" c="dimmed">
                            {doc.size}
                          </Text>

                          <Text
                            size="xs"
                            c="#6C6969"
                            className="cursor-pointer flex items-center gap-1 underline! mt-2!"
                          >
                            View Document{" "}
                            <ArrowUpRight size={14} color="#DD4F05" />
                          </Text>
                        </div>

                        <div className="text-right flex flex-col gap-4 ">
                          <StatusBadge
                            variant="light"
                            radius="xl"
                            bg="#F2F4F7"
                            color="#344054"
                            status="No Action"
                          />

                          <Text
                            size="xs"
                            c="dimmed"
                            className="cursor-pointer mt-2! underline! flex items-center gap-1"
                          >
                            Take Action{" "}
                            <ChevronDown size={14} color="#DD4F05" />
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

      {/* Workflow List */}

      {/* Sticky Footer */}
      <div className="sticky bottom-0 left-0 right-0 z-10 p-4 border-t border-[#E1E0E0] -mx-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] bg-white ">
        <Group justify="center">
          <Button color="#DD4F05" radius="xl">
            Complete Review
          </Button>

          <Button variant="outline" radius="xl" color="black">
            Request More Info
          </Button>
        </Group>
      </div>
    </Drawer>
  );
}
