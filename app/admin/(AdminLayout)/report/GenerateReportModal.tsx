"use client";

import {
  Modal,
  Text,
  Button,
  Group,
  Stack,
  Divider,
  Chip,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Calendar, X } from "lucide-react";
import { useState } from "react";
import { useCreateData } from "@/app/_lib/api/hooks";
import {
  adminApi,
  type GenerateReportPayload,
  type GeneratedReportFile,
} from "@/app/admin/_services/admin-api";
import { notifications } from "@mantine/notifications";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";

interface GenerateReportModalProps {
  opened: boolean;
  onClose: () => void;
  reportKey?: string;
  reportTitle?: string;
  reportDescription?: string;
}

function toIsoDateString(value: string, boundary: "start" | "end"): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (boundary === "start") {
    date.setHours(0, 0, 0, 0);
  } else {
    date.setHours(23, 59, 59, 999);
  }

  return date.toISOString();
}

function fallbackReportFileName(moduleKey: string | undefined, format: "CSV" | "PDF"): string {
  const dateStamp = new Date().toISOString().slice(0, 10);
  const moduleSegment = (moduleKey || "module").toLowerCase();
  return `${moduleSegment}-report-${dateStamp}.${format.toLowerCase()}`;
}

function downloadReportFile(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export default function GenerateReportModal({
  opened,
  onClose,
  reportKey,
  reportTitle,
  reportDescription,
}: GenerateReportModalProps) {
  const [format, setFormat] = useState<"CSV" | "PDF">("CSV");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const generateReportMutation = useCreateData<GeneratedReportFile, GenerateReportPayload>(
    (payload) => adminApi.reports.generate(payload),
    {
      onSuccess: ({ blob, fileName }) => {
        const resolvedFileName = fileName || fallbackReportFileName(reportKey, format);
        downloadReportFile(blob, resolvedFileName);

        notifications.show({
          title: "Report downloaded",
          message: "Your report has been generated and downloaded successfully.",
          color: "green",
        });

        onClose();
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Generate Report Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to generate report right now. Please try again.",
          color: "red",
        });
      },
    }
  );

  const handleGenerateReport = () => {
    if (!reportKey) {
      notifications.show({
        title: "Missing module",
        message: "Please choose a report module and try again.",
        color: "red",
      });
      return;
    }

    if (!startDate || !endDate) {
      notifications.show({
        title: "Date range required",
        message: "Select both start and end dates before generating your report.",
        color: "red",
      });
      return;
    }

    const startDateIso = toIsoDateString(startDate, "start");
    const endDateIso = toIsoDateString(endDate, "end");

    if (!startDateIso || !endDateIso) {
      notifications.show({
        title: "Invalid date",
        message: "Please provide valid dates and try again.",
        color: "red",
      });
      return;
    }

    if (new Date(startDateIso).getTime() > new Date(endDateIso).getTime()) {
      notifications.show({
        title: "Invalid date range",
        message: "Start date cannot be later than end date.",
        color: "red",
      });
      return;
    }

    generateReportMutation.mutate({
      module: reportKey,
      startDate: startDateIso,
      endDate: endDateIso,
      format,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div>
          <Text className="text-body-heading-300! text-xl! font-bold! mb-1!">
            Generate Report
          </Text>
          <Text className="text-body-text-50! text-sm!">
            Select the date range and format for your report
          </Text>
        </div>
      }
      centered
      radius="md"
      size="lg"
      closeOnClickOutside
      closeOnEscape
      closeButtonProps={{
        icon: (
          <X
            size={20}
            className="bg-[#e69fb6]! text-pink-500! font-bold! rounded-full! p-1! hover:bg-[#e69fb6]/80! transition-all! duration-300!"
          />
        ),
      }}
    >
      <Divider mb="md" />

      <Stack gap="md">
        {reportTitle && (
          <div>
            <Text size="sm" fw={500}>
              {reportTitle}
            </Text>
            {reportDescription && (
              <Text size="xs" c="dimmed">
                {reportDescription}
              </Text>
            )}
          </div>
        )}

        {/* Date Range */}
        <Group grow>
          <DatePickerInput
            label="Start Date"
            placeholder="DD/MM/YYYY"
            value={startDate}
            onChange={setStartDate}
            required
            rightSection={<Calendar size={14} />}
          />

          <DatePickerInput
            label="End Date"
            placeholder="DD/MM/YYYY"
            value={endDate}
            onChange={setEndDate}
            required
            rightSection={<Calendar size={14} />}
          />
        </Group>

        {/* Format */}
        <div>
          <Text size="sm" fw={500} mb={6}>
            Choose Report format <span className="text-red-500">*</span>
          </Text>

          <Chip.Group value={format} onChange={(value) => setFormat(value as "CSV" | "PDF")}>
            <Group>
              <Chip
                value="CSV"
                color="#DD4F05"
                variant="light"
                className=" rounded-full  data-[checked=true]:text-primary-400 data-[checked=true]:border-primary-400"
              >
                CSV
              </Chip>
              <Chip
                value="PDF"
                color="#DD4F05"
                variant="light"
                className=" rounded-full  data-[checked=true]:bg-primary-25 data-[checked=true]:border-primary-400"
              >
                PDF
              </Chip>
            </Group>
          </Chip.Group>
        </div>
      </Stack>

      

      {/* Footer */}
      <Group justify="flex-end" mt="xl" className="mt-10!">
        <Button
          variant="outline"
          radius="xl"
          onClick={onClose}
          disabled={generateReportMutation.isPending}
        >
          Close
        </Button>

        <Button
          color="orange"
          radius="xl"
          onClick={handleGenerateReport}
          loading={generateReportMutation.isPending}
        >
          Download Report
        </Button>
      </Group>
    </Modal>
  );
}
