"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Group, Modal, NumberInput, Textarea } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateData } from "@/app/_lib/api/hooks";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import CurrencySelector from "@/app/admin/_components/CurrencySelector";
import { CURRENCIES, type Currency } from "@/app/admin/_lib/constants";
import { adminApi } from "@/app/admin/_services/admin-api";

type CurrencyCode = Currency["code"];

const physicalCountSchema = z.object({
  currency: z.string().min(1, "Currency is required"),
  countedAmount: z
    .number({ message: "Counted amount is required" })
    .min(0, "Counted amount cannot be negative"),
  countDate: z.string().nullable().optional(),
  notes: z.string().optional(),
});

type PhysicalCountFormValues = z.infer<typeof physicalCountSchema>;

function startOfLocalDayIso(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  parsed.setHours(0, 0, 0, 0);
  return parsed.toISOString();
}

export default function RecordPhysicalCountModal({
  agentId,
  opened,
  onClose,
}: {
  agentId: string;
  opened: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<PhysicalCountFormValues | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PhysicalCountFormValues>({
    resolver: zodResolver(physicalCountSchema),
    defaultValues: {
      currency: "",
      countDate: null,
      notes: "",
    },
  });

  useEffect(() => {
    if (opened) {
      setConfirmOpen(false);
      setPendingValues(null);
      reset({
        currency: "",
        countedAmount: undefined,
        countDate: null,
        notes: "",
      });
    }
  }, [opened, reset]);

  const selectedCurrency = watch("currency");
  const currencyPrefix = CURRENCIES.find((currency) => currency.code === selectedCurrency)?.symbol;

  const recordCount = useCreateData(
    (body: PhysicalCountFormValues) => {
      const notes = body.notes?.trim();
      const countDate = body.countDate ? startOfLocalDayIso(body.countDate) : undefined;
      return adminApi.fxInventory.recordPhysicalCount(agentId, {
        currency: body.currency,
        countedAmount: body.countedAmount,
        ...(countDate ? { countDate } : {}),
        ...(notes ? { notes } : {}),
      });
    },
    {
      onSuccess: () => {
        setConfirmOpen(false);
        setPendingValues(null);
        onClose();
        notifications.show({
          title: "Physical Count Recorded",
          message: "The physical count has been saved.",
          color: "green",
        });
        void queryClient.invalidateQueries({ queryKey: [...adminKeys.fxInventory.all] });
      },
      onError: (error) => {
        setConfirmOpen(false);
        const apiResponse = (error as unknown as ApiError).data as ApiResponse | undefined;
        notifications.show({
          title: "Physical Count Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to record this physical count. Please try again.",
          color: "red",
        });
      },
    }
  );

  const closeForm = () => {
    setConfirmOpen(false);
    onClose();
  };

  return (
    <>
    <Modal
      opened={opened}
      onClose={closeForm}
      title="Record Physical Count"
      centered
      radius="md"
      styles={{
        title: {
          fontSize: "1.3rem", // ~24px
          fontWeight: 500,
        },
      }}
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit((values) => {
          setPendingValues(values);
          setConfirmOpen(true);
        })}
      >
        <p className="text-sm text-gray-500">
          Record a cash count for this agent. A new count is added and does not replace earlier counts.
        </p>

        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <div>
              <p className="mb-1 text-sm font-medium text-gray-900">
                Currency <span className="text-red-500">*</span>
              </p>
              <CurrencySelector
                value={field.value ? (field.value as CurrencyCode) : null}
                onChange={field.onChange}
                placeholder="Select currency"
              />
              {errors.currency?.message ? (
                <p className="mt-1 text-xs text-red-500">{errors.currency.message}</p>
              ) : null}
            </div>
          )}
        />

        <Controller
          name="countedAmount"
          control={control}
          render={({ field }) => (
            <NumberInput
              label="Counted amount"
              withAsterisk
              placeholder="0.00"
              thousandSeparator=","
              decimalScale={2}
              prefix={currencyPrefix}
              min={0}
              hideControls
              value={field.value}
              onChange={(value) => field.onChange(typeof value === "number" ? value : undefined)}
              error={errors.countedAmount?.message}
              radius="md"
            />
          )}
        />

        <Controller
          name="countDate"
          control={control}
          render={({ field }) => (
            <DatePickerInput
              label="Count date"
              placeholder="Defaults to today"
              value={field.value ?? null}
              onChange={field.onChange}
              clearable
              maxDate={new Date()}
              radius="md"
            />
          )}
        />

        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Notes"
              placeholder="Optional note about this count"
              minRows={3}
              value={field.value ?? ""}
              onChange={field.onChange}
              radius="md"
            />
          )}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" radius="xl" onClick={closeForm} type="button">
            Cancel
          </Button>
          <Button type="submit" color="orange" radius="xl">
            Save Count
          </Button>
        </Group>
      </form>
    </Modal>
    <ConfirmationModal
      opened={confirmOpen}
      onClose={() => setConfirmOpen(false)}
      title="Record Physical Count?"
      message="A new count will be added for the selected currency and will not replace earlier counts."
      primaryButtonText="Yes, Record Count"
      secondaryButtonText="No, Close"
      loading={recordCount.isPending}
      onPrimary={() => {
        if (pendingValues) recordCount.mutate(pendingValues);
      }}
      onSecondary={() => setConfirmOpen(false)}
    />
    </>
  );
}
