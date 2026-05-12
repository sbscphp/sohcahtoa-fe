"use client";

import { Card, Text, Group } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import GenerateReportModal from "./GenerateReportModal";
import { useFetchDataSeperateLoading } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi, type ReportModuleItem } from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";

interface ReportItem {
  key: string;
  title: string;
  description: string;
}

const EMPTY_MODULE_DESCRIPTION = "Generate and download reports for this module.";

function mapReportModules(modules: ReportModuleItem[] | undefined): ReportItem[] {
  if (!Array.isArray(modules)) {
    return [];
  }

  return modules.map((moduleItem) => ({
    key: moduleItem.key,
    title: moduleItem.name || moduleItem.key,
    description: moduleItem.description?.trim() || EMPTY_MODULE_DESCRIPTION,
  }));
}

export default function ReportsGrid() {
  const [opened, setOpened] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const reportsModulesQuery = useFetchDataSeperateLoading<ApiResponse<ReportModuleItem[]>>(
    [...adminKeys.reports.modules()],
    () => adminApi.reports.modules(),
    true
  );
  const reports = useMemo(
    () => mapReportModules(reportsModulesQuery.data?.data),
    [reportsModulesQuery.data?.data]
  );

  const handleOpenReportModal = (report: ReportItem) => {
    setSelectedReport(report);
    setOpened(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reportsModulesQuery.isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={`report-skeleton-${index}`}
              radius="md"
              padding="md"
              withBorder
              className="border-[#E1E0E0]! shadow-sm! shadow-[#1018280D]!"
            >
              <Text fw={600} size="sm">
                Loading module...
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Please wait while report modules are being fetched.
              </Text>
            </Card>
          ))}

        {!reportsModulesQuery.isLoading &&
          reports.map((report) => (
            <Card
              key={report.key}
              radius="md"
              padding="md"
              withBorder
              onClick={() => handleOpenReportModal(report)}
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

                <ArrowUpRight size={16} className="text-primary-400" />
              </Group>
            </Card>
          ))}
      </div>

      {!reportsModulesQuery.isLoading && reportsModulesQuery.isError && (
        <Text c="red" size="sm" mt={12}>
          Unable to load report modules right now. Please refresh and try again.
        </Text>
      )}

      {!reportsModulesQuery.isLoading && !reportsModulesQuery.isError && reports.length === 0 && (
        <Card radius="md" padding="md" withBorder mt={12}>
          <Text fw={600} size="sm">
            No report modules available
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            Report modules will appear here once they are configured.
          </Text>
        </Card>
      )}

      <GenerateReportModal
        opened={opened}
        onClose={() => setOpened(false)}
        reportKey={selectedReport?.key}
        reportTitle={selectedReport?.title}
        reportDescription={selectedReport?.description}
      />
    </>
  );
}
