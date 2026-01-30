"use client";

import { Card, Text, Group, Button } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import GenerateReportModal from "./GenerateReportModal";

interface ReportItem {
  title: string;
  description: string;
  onClick?: () => void;
}

const reports: ReportItem[] = [
  {
    title: "Outlets management",
    description: "Monitor outlet-related actions with supporting reports.",
  },
  {
    title: "Rate Management",
    description: "Reports on rate creation, updates, and variances.",
  },
  {
    title: "Transaction management",
    description: "Reports on customer transactions and flags.",
  },
  {
    title: "Workflow management",
    description: "Reports on workflow executions and escalations.",
  },
  {
    title: "Agents management",
    description: "Monitor outlet-related actions with supporting reports.",
  },
  {
    title: "Franchise management",
    description: "Reports on franchise onboarding and status.",
  },
  {
    title: "Branch management",
    description: "Reports on branch set-up, performance & incidents.",
  },
  {
    title: "Incidence management",
    description: "Reports on incidents and resolutions.",
  },
];

export default function ReportsGrid() {
    const [opened, setOpened] = useState(false);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {reports.map((report, index) => (
        <Card
          key={index}
          radius="md"
          padding="md"
          withBorder
          
          onClick={report.onClick}
          className="cursor-pointer hover:shadow-md transition-shadow border-[#E1E0E0]! shadow-sm! shadow-[#1018280D]!"
        >
          <Group justify="space-between" align="center">
            <div>
              <Text fw={600} size="sm">
                {report.title}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {report.description}
              </Text>
            </div>

            <button onClick={() => setOpened(true)}><ArrowUpRight size={16} className="text-primary-400" /></button>
          </Group>
          <GenerateReportModal
        opened={opened}
        onClose={() => setOpened(false)}
      />
        </Card>
      ))}
    </div>
  );
}
