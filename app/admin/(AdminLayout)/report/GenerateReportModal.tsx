"use client";

import {
  Modal,
  Text,
  Button,
  Group,
  Stack,
  Divider,
  Chip,
  Badge,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { ModalSuccess } from "../../_components/ModalSuccess";
import { useRouter } from "next/navigation";

interface GenerateReportModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function GenerateReportModal({
  opened,
  onClose,
}: GenerateReportModalProps) {
  const [format, setFormat] = useState<"CSV" | "PDF">("CSV");
  const [value, setValue] = useState<string | null>(null);
  const [ isOpened, setIsOpened ] = useState(false);
  const router = useRouter();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="md"
      size="lg"

      withCloseButton={false}
      overlayProps={{
        backgroundOpacity: 0,
        blur: 0.5,
      }}
    >
      {/* Header */}
      <Group justify="space-between" mb="sm" className="mb-2!">
        <div>
          <Text fw={600}>Generate Report</Text>
          <Text size="xs" c="dimmed">
            Select the date range and format for your report
          </Text>
        </div>

        <Badge
          className="py-2! px-1! rounded-full"
          color="#DD4F05"
          size="xs"
          onClick={onClose}
        >
          ✕
        </Badge>
      </Group>

      <Divider my="lg" />

      <Stack gap="md">
        {/* Date Range */}
        <Group grow>
          <DatePickerInput
            label="Start Date"
            placeholder="DD/MM/YYYY"
            value={value}
            onChange={setValue}
            required
            rightSection={<Calendar size={14} />}
          />

          <DatePickerInput
            label="End Date"
            placeholder="DD/MM/YYYY"
            value={value}
            onChange={setValue}
            required
            rightSection={<Calendar size={14} />}
          />
        </Group>

        {/* Format */}
        <div>
          <Text size="sm" fw={500} mb={6}>
            Choose Report format <span className="text-red-500">*</span>
          </Text>

          <Chip.Group value={format} onChange={(v) => setFormat(v as any)}>
            <Group>
              <Chip
                value="CSV"
                color="#DD4F05"
                variant="light"
                checked={false}
                defaultChecked={false}
                className=" rounded-full  data-[checked=true]:text-primary-400 data-[checked=true]:border-primary-400"
              >
                {" "}
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
        <Button variant="outline" radius="xl" onClick={onClose}>
          Close
        </Button>

        <Button color="orange" radius="xl" onClick={() => setIsOpened(true)}>
          Download Report
        </Button>
      </Group>
      <ModalSuccess
            opened={isOpened}
            onClose={() =>{ setIsOpened(false); {onClose();}}}
            
            props={{
              title: "Login Successful",
              description: "You have successfully logged in to your account.",
            }}
          />
    </Modal>
  );
}
