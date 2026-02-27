"use client";

import React, { useState, useRef } from "react";
import {
  Modal,
  Text,
  Button,
  Stack,
  Group,
  NumberInput,
  Select,
  TextInput,
  Box,
  ThemeIcon,
  UnstyledButton,
  Card,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash, Calendar, Check, FileText } from "lucide-react";
import "@mantine/dates/styles.css";

// --- 1. Updated Zod Schema ---
const escrowSchema = z.object({
  settlementAccount: z.string().min(1, "Settlement account is required"),

  amount: z
    .number({ invalid_type_error: "Amount is required" })
    .min(1, "Amount must be greater than 0"),

  referenceId: z.string().min(1, "Reference ID is required"),

  // FIX: Use coerce.date() to handle strings/dates, and refine to ensure it's a valid date
  dateOfFunding: z.coerce.date()
    .refine((date) => !isNaN(date.getTime()), { message: "Date is required" }),

  receipt: z
    .any()
    .refine((file) => file instanceof File, "Receipt is required"),
});

type FormData = z.infer<typeof escrowSchema>;

// --- 2. Mock Data ---
const SETTLEMENT_ACCOUNTS = [
  {
    value: "access-001",
    label: "Access Bank - 0000000089 Sohcahtoa Payout BDC (NGN)",
  },
  {
    value: "sterling-002",
    label: "Sterling Bank - 0000000089 Sohcahtoa Payout BDC (NGN)",
  },
  {
    value: "chase-003",
    label: "Chase Bank - 0000000089 Sohcahtoa Payout BDC (USD)",
  },
  {
    value: "barclays-004",
    label: "Barclays Bank - 0000000089 Sohcahtoa Payout BDC (GBP)",
  },
];

// --- 3. HELPER: File Upload UI ---
const FileUploadInput = ({
  value,
  onChange,
  error,
}: {
  value: File | null;
  onChange: (f: File | null) => void;
  error?: string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  if (value) {
    // FILLED STATE
    return (
      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
        <Group>
          <ThemeIcon variant="light" color="orange" size="lg" radius="md">
            <FileText size={20} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={500} lineClamp={1}>
              {value.name}
            </Text>
            <Text size="xs" c="dimmed">
              {(value.size / 1024).toFixed(0)} KB
            </Text>
          </div>
        </Group>
        <ActionIconWrapper onClick={() => onChange(null)} color="red">
          <Trash size={16} />
        </ActionIconWrapper>
      </div>
    );
  }

  // EMPTY STATE
  return (
    <div
      className={`border border-gray-200 rounded-md p-2 flex items-center justify-between bg-white ${error ? "border-red-500" : ""}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,.pdf"
      />
      <Text size="sm" c="dimmed" ml="sm">
        Drop files to upload
      </Text>
      <Button
        variant="light"
        color="orange"
        radius="xl"
        size="xs"
        className="text-orange-600 bg-orange-50 hover:bg-orange-100"
        onClick={() => fileInputRef.current?.click()}
      >
        Select File
      </Button>
    </div>
  );
};

// Simple wrapper for clickable icons
const ActionIconWrapper = ({ children, onClick, color }: any) => (
  <UnstyledButton
    onClick={onClick}
    className={`flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-${color}-500 transition-colors`}
  >
    {children}
  </UnstyledButton>
);

// --- 4. MAIN FORM COMPONENT ---
export const FundEscrowForm = ({
  onSubmit,
}: {
  onSubmit: (data: FormData) => void;
}) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(escrowSchema),
    mode: "onChange",
  });

  const selectedAccountValue = watch("settlementAccount");
  const selectedAccountLabel = SETTLEMENT_ACCOUNTS.find(
    (a) => a.value === selectedAccountValue,
  )?.label;

  // Custom Styles
  const inputStyles = {
    input: {
      backgroundColor: "#fff",
      border: "1px solid #E5E7EB",
      height: "46px",
    },
    label: {
      fontWeight: 700,
      marginBottom: 6,
      fontSize: "14px",
      color: "#374151",
    },
  };

  return (
    <Card
      p="xl"
      radius="lg"
      withBorder
      className="w-full max-w-xl mx-auto bg-white border-2 border-blue-200 border-dashed shadow-sm"
    >
      <Stack align="center" gap={4} mb="xl">
        <Text fw={700} size="lg">
          Fund Escrow Account
        </Text>
        <Text size="sm" c="dimmed">
          Fill out the basic information to fund escrow account
        </Text>
      </Stack>

      <Stack gap="md">
        {/* Settlement Account Custom UI */}
        <Box>
          <Text fw={700} size="sm" mb={6} c="dark.6">
            Settlement Account <span className="text-red-500">*</span>
          </Text>
          {selectedAccountValue ? (
            // FILLED STATE
            <div className="flex items-center justify-between p-3 bg-gray-100 border border-gray-200 rounded-md">
              <Group gap="sm">
                <ThemeIcon color="green" radius="xl" size="sm">
                  <Check size={12} />
                </ThemeIcon>
                <Text size="sm" fw={500} c="dark">
                  {selectedAccountLabel}
                </Text>
              </Group>
              <ActionIconWrapper
                onClick={() => setValue("settlementAccount", "")}
                color="red"
              >
                <Trash size={16} />
              </ActionIconWrapper>
            </div>
          ) : (
            // EMPTY STATE
            <Controller
              name="settlementAccount"
              control={control}
              render={({ field }) => (
                <Select
                  placeholder="Select settlement account"
                  data={SETTLEMENT_ACCOUNTS}
                  {...field}
                  error={errors.settlementAccount?.message}
                  styles={inputStyles}
                />
              )}
            />
          )}
        </Box>

        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <NumberInput
              label="Amount"
              withAsterisk
              placeholder="0.00"
              leftSection="₦"
              hideControls
              decimalScale={2}
              fixedDecimalScale
              value={field.value}
              onChange={field.onChange}
              error={errors.amount?.message}
              styles={inputStyles}
            />
          )}
        />

        <Group grow align="start">
          <Controller
            name="referenceId"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Reference ID"
                withAsterisk
                placeholder="Enter reference ID"
                {...field}
                error={errors.referenceId?.message}
                styles={inputStyles}
              />
            )}
          />
          <Controller
            name="dateOfFunding"
            control={control}
            render={({ field }) => (
              <DateInput
                label="Date of funding"
                withAsterisk
                placeholder="dd/mm/yyyy"
                rightSection={<Calendar size={16} className="text-gray-400" />}
                value={field.value}
                onChange={field.onChange}
                error={errors.dateOfFunding?.message}
                styles={inputStyles}
                clearable
              />
            )}
          />
        </Group>

        <Box>
          <Text fw={700} size="sm" mb={6} c="dark.6">
            Upload Transfer Receipt <span className="text-red-500">*</span>
          </Text>
          <Controller
            name="receipt"
            control={control}
            render={({ field }) => (
              <FileUploadInput
                value={field.value}
                onChange={field.onChange}
                error={errors.receipt?.message as string}
              />
            )}
          />
        </Box>

        {/* Buttons */}
        <Group grow mt="lg">
          <Button
            variant="default"
            radius="xl"
            size="md"
            className="text-gray-600 border-gray-300"
          >
            Cancel
          </Button>
          <Button
            color="orange"
            radius="xl"
            size="md"
            className="bg-[#EA580C] hover:bg-orange-700"
            onClick={handleSubmit(onSubmit)} 
            disabled={!isValid}
          >
            Fund Account
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

// --- 5. MODALS ---

export interface ModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export const ConfirmationModal = ({ opened, onClose, onConfirm }: ModalProps) => (
  <Modal
    opened={opened}
    onClose={onClose}
    centered
    withCloseButton={false}
    padding="xl"
    radius="lg"
  >
    <Stack align="center" gap="md">
      <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full">
        <div className="flex items-center justify-center w-8 h-8 text-orange-800 bg-orange-300 rounded-full">
          !
        </div>
      </div>

      <Text fw={700} size="lg">
        Fund Escrow Account?
      </Text>
      <Text c="dimmed" size="sm" ta="center" px="md">
        Are you sure you want to send money to this escrow account?
      </Text>

      <Group w="100%" grow mt="md">
        <Button
          color="orange"
          radius="xl"
          size="md"
          className="bg-[#EA580C] hover:bg-orange-700"
          onClick={onConfirm}
        >
          Yes, Create
        </Button>
        <Button
          variant="default"
          radius="xl"
          size="md"
          onClick={onClose}
          className="border-gray-300"
        >
          No, Close
        </Button>
      </Group>
    </Stack>
  </Modal>
);

export const SuccessModal = ({ opened, onClose }: ModalProps) => (
  <Modal
    opened={opened}
    onClose={onClose}
    centered
    withCloseButton={false}
    padding="xl"
    radius="lg"
  >
    <Stack align="center" gap="md">
      {/* Green Success Animation Placeholder */}
      <div className="relative mb-2">
        <div className="flex items-center justify-center w-20 h-20 bg-green-50 rounded-full">
          <div className="flex items-center justify-center w-12 h-12 text-white bg-green-500 rounded-full shadow-lg shadow-green-200">
            <Check size={24} strokeWidth={4} />
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-1 h-1 bg-green-400 rounded-full"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-1 h-1 bg-green-400 rounded-full"></div>
      </div>

      <Text fw={700} size="lg">
        Escrow Funded Successfully
      </Text>
      <Text c="dimmed" size="sm" ta="center" px="sm">
        Incident successfully created. An incident ID will be sent to the
        customer involved.
      </Text>

      <Group w="100%" grow mt="md" gap="sm">
        <Button
          color="orange"
          radius="xl"
          size="md"
          className="bg-[#EA580C] hover:bg-orange-700"
          onClick={onClose}
        >
          Manage Escrow Account
        </Button>
        <Button
          variant="default"
          radius="xl"
          size="md"
          onClick={onClose}
          className="border-gray-300"
        >
          No, Close
        </Button>
      </Group>
    </Stack>
  </Modal>
);