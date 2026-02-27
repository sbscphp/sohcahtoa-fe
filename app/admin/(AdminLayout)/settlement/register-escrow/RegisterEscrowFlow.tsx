"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  TextInput,
  Select,
  Button,
  Stack,
  Group,
  Modal,
  Box,
  ThemeIcon,
  Loader,
} from "@mantine/core";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, CheckCircle2 } from "lucide-react";

// --- 1. Zod Schema ---
const registerSchema = z.object({
  currency: z.string().min(1, "Currency is required"),
  bankName: z.string().min(3, "Bank name is required"),
  accountNumber: z.string().min(10, "Account number must be at least 10 digits"),
});

type FormData = z.infer<typeof registerSchema>;

// --- 2. Mock Data ---
const CURRENCIES = [
  { value: "NGN", label: "NGN - Naira" },
  { value: "USD", label: "USD - US Dollars" },
  { value: "EUR", label: "EUR - Euros" },
  { value: "GBP", label: "GBP - Great Britain Pounds" },
];

// --- 3. HELPER: Styles ---
const inputStyles = {
  input: {
    height: "50px",
    backgroundColor: "#ffffff",
    borderColor: "#E5E7EB",
    borderRadius: "8px",
    color: "#1F2937",
  },
  label: {
    fontWeight: 600,
    marginBottom: "8px",
    fontSize: "14px",
    color: "#374151",
  },
  error: {
    fontSize: "12px",
  },
};

// --- 4. FORM COMPONENT ---
export const RegisterEscrowForm = ({ onSubmit }: { onSubmit: (data: FormData) => void }) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const accountNumber = watch("accountNumber");
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedName, setResolvedName] = useState<string | null>(null);

  // Simulate Account Name Resolution when account number is entered
  useEffect(() => {
    if (accountNumber && accountNumber.length >= 10) {
      setIsResolving(true);
      const timer = setTimeout(() => {
        setIsResolving(false);
        setResolvedName("SOHCHATOA PAYOUTBDC");
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setResolvedName(null);
    }
  }, [accountNumber]);

  return (
    <Card
      p="xl"
      radius="lg"
      withBorder
      className="w-full max-w-xl mx-auto bg-white border-2 border-blue-200 border-dashed shadow-sm"
    >
      <Stack align="center" gap={4} mb="xl">
        <Text fw={700} size="lg">Register Escrow Account</Text>
        <Text size="sm" c="dimmed">Fill out the basic information for settlement account</Text>
      </Stack>

      <Stack gap="lg">
        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <Select
              label={
                <Text span fw={600} size="sm">
                  Currency Type <span className="text-red-500">*</span>
                </Text>
              }
              placeholder="Select currency"
              data={CURRENCIES}
              {...field}
              error={errors.currency?.message}
              styles={inputStyles}
            />
          )}
        />

        <Controller
          name="bankName"
          control={control}
          render={({ field }) => (
            <TextInput
              label={
                <Text span fw={600} size="sm">
                  Bank Name <span className="text-red-500">*</span>
                </Text>
              }
              placeholder="Enter bank name"
              {...field}
              error={errors.bankName?.message}
              styles={inputStyles}
            />
          )}
        />

        <Controller
          name="accountNumber"
          control={control}
          render={({ field }) => (
            <TextInput
              label={
                <Text span fw={600} size="sm">
                  Account Number <span className="text-red-500">*</span>
                </Text>
              }
              placeholder="Enter account number"
              {...field}
              error={errors.accountNumber?.message}
              styles={inputStyles}
            />
          )}
        />

        {/* Account Resolution Display */}
        <Box className="h-[60px]">
          {isResolving ? (
            <Group justify="center" h="100%">
              <Loader size="sm" color="orange" />
              <Text size="sm" c="dimmed">Verifying account details...</Text>
            </Group>
          ) : resolvedName ? (
            <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-md animate-fade-in">
              <ThemeIcon color="green" radius="xl" size="md">
                <Check size={14} strokeWidth={4} />
              </ThemeIcon>
              <Text size="sm" fw={700} c="dark" tt="uppercase">
                {resolvedName}
              </Text>
            </div>
          ) : null}
        </Box>

        {/* Buttons */}
        <Group grow mt="sm">
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
            className="bg-[#EA580C] hover:bg-orange-700 transition-colors"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || !resolvedName}
          >
            Register Escrow
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

// --- 5. MODALS ---

interface ModalProps {
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
    overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
  >
    <Stack align="center" gap="md" py="md">
      <div className="flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full">
        <div className="flex items-center justify-center w-10 h-10 text-xl font-bold text-orange-800 bg-orange-300 rounded-full">
          !
        </div>
      </div>

      <Text fw={700} size="xl">Register Escrow?</Text>
      <Text c="dimmed" size="sm" ta="center" px="md">
        Are you sure you want to register this escrow account? An incident ID will be attached to it.
      </Text>

      <Group w="100%" grow mt="lg">
        <Button
          color="orange"
          radius="xl"
          size="lg"
          className="bg-[#EA580C] hover:bg-orange-700 font-medium"
          onClick={onConfirm}
        >
          Yes, Register
        </Button>
        <Button
          variant="default"
          radius="xl"
          size="lg"
          onClick={onClose}
          className="border-gray-300 text-gray-700"
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
    overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
  >
    <Stack align="center" gap="md" py="md">
      {/* Green Success Animation Placeholder */}
      <div className="relative mb-4">
        <div className="flex items-center justify-center w-24 h-24 bg-green-50 rounded-full">
          <div className="flex items-center justify-center w-14 h-14 text-white bg-green-500 rounded-full shadow-lg shadow-green-200">
            <Check size={32} strokeWidth={4} />
          </div>
        </div>
        {/* Decorative dots (simulating animation) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-1.5 h-1.5 bg-green-400 rounded-full"></div>
      </div>

      <Text fw={700} size="xl">New Escrow Added</Text>
      <Text c="dimmed" size="sm" ta="center" px="lg">
        A new Escrow account has been added. You can now fund and receive payments via this Escrow account.
      </Text>

      <Group w="100%" grow mt="lg">
        <Button
          color="orange"
          radius="xl"
          size="lg"
          className="bg-[#EA580C] hover:bg-orange-700 font-medium"
          onClick={onClose}
        >
          Manage Escrow
        </Button>
        <Button
          variant="default"
          radius="xl"
          size="lg"
          onClick={onClose}
          className="border-gray-300 text-gray-700"
        >
          No, Close
        </Button>
      </Group>
    </Stack>
  </Modal>
);

// --- 6. MAIN PAGE WRAPPER ---

export default function RegisterEscrowPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);

  // 1. Triggered when form is valid and submitted
  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    setConfirmOpen(true);
  };

  // 2. Triggered when "Yes, Register" is clicked
  const handleConfirm = () => {
    setConfirmOpen(false);
    console.log("Registering:", formData);
    
    // Simulate API delay
    setTimeout(() => {
      setSuccessOpen(true);
    }, 600);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      
      {/* Form Component */}
      <RegisterEscrowForm onSubmit={handleFormSubmit} />

      {/* Confirmation Modal */}
      <ConfirmationModal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
      />

      {/* Success Modal */}
      <SuccessModal
        opened={successOpen}
        onClose={() => setSuccessOpen(false)}
      />
    </div>
  );
}