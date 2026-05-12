"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Stack,
  Text,
  TextInput,
  Textarea,
  Group,
  ActionIcon,
  Divider,
  Skeleton,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { Calendar, Clock, ArrowLeftRight } from "lucide-react";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import CurrencySelector from "@/app/admin/_components/CurrencySelector";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { notifications } from "@mantine/notifications";
import { useFetchSingleData, usePutData } from "@/app/_lib/api/hooks";
import {
  adminApi,
  type CreateRatePayload,
  type RateDetailsData,
} from "@/app/admin/_services/admin-api";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminRoutes } from "@/lib/adminRoutes";
import { CURRENCIES } from "@/app/admin/_lib/constants";
import Image from "next/image";
import Cbn from "@/app/assets/svg/cbn-logo.svg"

const SECTION_TITLE_CLASS = "text-lg! font-semibold! text-orange-500!";
const SECTION_DESC_CLASS = "text-base! text-body-text-100! mb-4!";
type CurrencyCode = (typeof CURRENCIES)[number]["code"];

type RateFormValues = {
  buyCurrency: CurrencyCode | null;
  buyRateInput: string;
  sellCurrency: CurrencyCode | null;
  sellRateInput: string;
  startDate: string | null;
  startTime: string;
  endDate: string | null;
  endTime: string;
  note: string;
};

function parseRateValue(value: string): number | null {
  const parsed = Number(value.trim());
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function buildDateTimeIso(date: string | null, time: string): string | null {
  if (!date || !time.trim()) return null;

  const trimmed = time.trim();
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  const amPmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])$/);
  const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  if (amPmMatch) {
    const h = Number(amPmMatch[1]);
    const m = Number(amPmMatch[2]);
    const s = Number(amPmMatch[3] ?? "0");
    const meridiem = amPmMatch[4].toUpperCase();
    if (h < 1 || h > 12 || m > 59 || s > 59) return null;
    hours = h % 12;
    if (meridiem === "PM") hours += 12;
    minutes = m;
    seconds = s;
  } else if (twentyFourHourMatch) {
    const h = Number(twentyFourHourMatch[1]);
    const m = Number(twentyFourHourMatch[2]);
    const s = Number(twentyFourHourMatch[3] ?? "0");
    if (h > 23 || m > 59 || s > 59) return null;
    hours = h;
    minutes = m;
    seconds = s;
  } else {
    return null;
  }

  const dateTime = new Date(date);
  dateTime.setHours(hours, minutes, seconds, 0);
  return Number.isNaN(dateTime.getTime()) ? null : dateTime.toISOString();
}

function toDateTimeParts(iso: string | null | undefined): { date: string | null; time: string } {
  if (!iso) return { date: null, time: "" };
  const dateObj = new Date(iso);
  if (Number.isNaN(dateObj.getTime())) return { date: null, time: "" };

  return {
    date: dateObj.toLocaleDateString("en-CA"),
    time: dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

function buildRatePayload(values: RateFormValues): CreateRatePayload | null {
  const buyRate = parseRateValue(values.buyRateInput);
  const sellRate = parseRateValue(values.sellRateInput);
  const validFrom = buildDateTimeIso(values.startDate, values.startTime);
  const validUntil = buildDateTimeIso(values.endDate, values.endTime);

  if (!values.buyCurrency || !values.sellCurrency || buyRate === null || sellRate === null) {
    return null;
  }
  if (!validFrom || !validUntil) {
    return null;
  }
  if (new Date(validFrom).getTime() >= new Date(validUntil).getTime()) {
    return null;
  }

  return {
    fromCurrency: values.buyCurrency,
    toCurrency: values.sellCurrency,
    buyRate,
    sellRate,
    validFrom,
    validUntil,
    note: values.note.trim() || undefined,
  };
}

export default function RateDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const rateId = params?.id ?? "";
  const hasPrefilledRef = useRef(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const form = useForm<RateFormValues>({
    initialValues: {
      buyCurrency: "USD",
      buyRateInput: "",
      sellCurrency: "NGN",
      sellRateInput: "",
      startDate: null,
      startTime: "",
      endDate: null,
      endTime: "",
      note: "",
    },
    validate: {
      buyCurrency: (value) => (value ? null : "Select buy currency"),
      buyRateInput: (value) =>
        parseRateValue(value) !== null ? null : "Enter a valid buy rate greater than 0",
      sellCurrency: (value) => (value ? null : "Select sell currency"),
      sellRateInput: (value) =>
        parseRateValue(value) !== null ? null : "Enter a valid sell rate greater than 0",
      startDate: (value) => (value ? null : "Effective start date is required"),
      startTime: (value, values) => {
        if (!value.trim()) return "Effective start time is required";
        return buildDateTimeIso(values.startDate, value) ? null : "Enter a valid start time";
      },
      endDate: (value) => (value ? null : "Effective end date is required"),
      endTime: (value, values) => {
        if (!value.trim()) return "Effective end time is required";
        const validUntil = buildDateTimeIso(values.endDate, value);
        if (!validUntil) return "Enter a valid end time";
        const validFrom = buildDateTimeIso(values.startDate, values.startTime);
        if (validFrom && new Date(validUntil).getTime() <= new Date(validFrom).getTime()) {
          return "Effective end must be after effective start";
        }
        return null;
      },
    },
  });

  const rateDetailQuery = useFetchSingleData<ApiResponse<RateDetailsData>>(
    [...adminKeys.rate.detail(rateId)],
    () => adminApi.rate.getById(rateId),
    Boolean(rateId)
  );

  useEffect(() => {
    if (!rateDetailQuery.data?.data || hasPrefilledRef.current) {
      return;
    }

    const detail = rateDetailQuery.data.data;
    const start = toDateTimeParts(detail.validFrom);
    const end = toDateTimeParts(detail.validUntil);

    const buyCurrency = CURRENCIES.some((c) => c.code === detail.fromCurrency)
      ? (detail.fromCurrency as CurrencyCode)
      : null;
    const sellCurrency = CURRENCIES.some((c) => c.code === detail.toCurrency)
      ? (detail.toCurrency as CurrencyCode)
      : null;

    form.setValues({
      buyCurrency,
      buyRateInput: String(detail.buyRate ?? ""),
      sellCurrency,
      sellRateInput: String(detail.sellRate ?? ""),
      startDate: start.date,
      startTime: start.time,
      endDate: end.date,
      endTime: end.time,
      note: detail.note ?? "",
    });
    hasPrefilledRef.current = true;
  }, [form, rateDetailQuery.data]);

  const updateRateMutation = usePutData(
    (payload: CreateRatePayload) => adminApi.rate.update(rateId, payload),
    {
      onSuccess: async () => {
        setIsConfirmOpen(false);
        setIsSuccessOpen(true);
        notifications.show({
          title: "Rate Updated",
          message: "Rate details have been successfully updated.",
          color: "green",
        });

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: [...adminKeys.rate.all] }),
          queryClient.invalidateQueries({ queryKey: [...adminKeys.rate.stats()] }),
          queryClient.invalidateQueries({ queryKey: [...adminKeys.rate.detail(rateId)] }),
        ]);
      },
      onError: (error) => {
        const apiResponse = (error as unknown as ApiError).data as ApiResponse;
        notifications.show({
          title: "Update Rate Failed",
          message:
            apiResponse?.error?.message ??
            error.message ??
            "Unable to update rate right now. Please try again.",
          color: "red",
        });
      },
    }
  );

  const isLoading = rateDetailQuery.isLoading;
  const hasError = rateDetailQuery.isError || (!isLoading && !rateDetailQuery.data?.data);
  const errorMessage = rateDetailQuery.error?.message ?? "Rate details could not be loaded.";
  const justificationWordCount = form.values.note.trim()
    ? form.values.note.trim().split(/\s+/).length
    : 0;

  const handleSwapConversion = () => {
    const { buyCurrency, sellCurrency, buyRateInput, sellRateInput } = form.values;
    form.setValues({
      ...form.values,
      buyCurrency: sellCurrency,
      sellCurrency: buyCurrency,
      buyRateInput: sellRateInput,
      sellRateInput: buyRateInput,
    });
  };

  const handleCancel = () => {
    router.push(adminRoutes.adminRate());
  };

  const handleSaveClick = () => {
    const result = form.validate();
    if (result.hasErrors) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmUpdate = () => {
    const result = form.validate();
    if (result.hasErrors) {
      setIsConfirmOpen(false);
      return;
    }

    const payload = buildRatePayload(form.values);
    if (!payload) {
      notifications.show({
        title: "Invalid Payload",
        message: "Please review the form fields and try again.",
        color: "red",
      });
      return;
    }

    updateRateMutation.mutate(payload);
  };

  const handleSuccessManageRate = () => {
    setIsSuccessOpen(false);
    router.push(adminRoutes.adminRate());
  };

  if (!rateId) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <Text c="red" mb="md">
          Invalid rate id. Please select a valid rate.
        </Text>
        <CustomButton buttonType="secondary" onClick={() => router.push(adminRoutes.adminRate())}>
          Back to Rates
        </CustomButton>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <Skeleton height={26} radius="sm" />
        <Skeleton height={160} radius="md" />
        <Skeleton height={160} radius="md" />
        <Skeleton height={120} radius="md" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <Text c="red" mb="md">
          {errorMessage}
        </Text>
        <Group>
          <CustomButton buttonType="secondary" onClick={() => router.push(adminRoutes.adminRate())}>
            Back to Rates
          </CustomButton>
          <CustomButton buttonType="primary" onClick={() => rateDetailQuery.refetch()}>
            Retry
          </CustomButton>
        </Group>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-2xl bg-white shadow-sm p-6 md:p-8">
        <section className="mb-8">
          <Text className={SECTION_TITLE_CLASS} mb={4}>
            Main Setting
          </Text>
          <Text className={SECTION_DESC_CLASS}>
            Setup the buy and selling rate for this specific currency
          </Text>

          <Stack gap="lg" mt="xl">
            <div className="p-4 rounded-xl! bg-gray-25">
              <Text size="sm" fw={500} mb={6} className="text-body-text-100!">
                Exchange: <span className="font-bold!">BUY</span>{" "}
                <span className="text-red-500">*</span>
              </Text>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CurrencySelector
                  value={form.values.buyCurrency}
                  onChange={(value) => form.setFieldValue("buyCurrency", value)}
                />
                <TextInput
                  value="1"
                  readOnly
                  radius="md"
                  className="flex-1 min-w-[140px]"
                  classNames={{ input: "text-xl! font-bold! text-start!" }}
                  styles={{
                    input: {
                      background: "transparent",
                      border: "none",
                      boxShadow: "none",
                      padding: 0,
                      height: "fit-content",
                    },
                  }}
                />
                <ActionIcon
                  className="h-15! w-15! rounded-full!"
                  variant="filled"
                  color="dark"
                  onClick={handleSwapConversion}
                  aria-label="Swap conversion"
                  disabled={updateRateMutation.isPending}
                >
                  <div className="flex items-center rounded-md justify-center bg-[#6d6b6e] h-5 w-5">
                    <ArrowLeftRight size={16} />
                  </div>
                </ActionIcon>
                <TextInput
                  placeholder="Naira (₦) Equivalent"
                  value={form.values.buyRateInput}
                  onChange={(e) => form.setFieldValue("buyRateInput", e.currentTarget.value)}
                  error={form.errors.buyRateInput}
                  radius="md"
                  className="flex-1 min-w-[140px]"
                  classNames={{ input: "text-xl! font-bold! text-end!" }}
                  styles={{
                    input: {
                      background: "transparent",
                      border: "none",
                      boxShadow: "none",
                      padding: 0,
                      height: "fit-content",
                    },
                  }}
                />
              </div>
              {form.errors.buyCurrency && (
                <Text c="red" size="xs" mt={6}>
                  {form.errors.buyCurrency}
                </Text>
              )}
            </div>
            <div className="flex justify-between border border-[#EEA782] bg-[#FFF6F1] rounded-2xl px-3 py-4">
              <div className="flex items-center ">
                <Image src={Cbn} alt="CBN Rate" className=" w-12" />
                <div>
                  <h4 className="text-[#DD4F05] font-medium">API: CBN Rate (€)</h4>
                  <p className="text-[#4D4B4B] text-sm font-medium italic"><span className="text-[#F63D68] font-normal">Kindly note:</span> Your buy rate can exceed 2.0% of CBN recommended rate</p>
                </div>
              </div>
              <h2 className="font-bold text-[#131212] text-base">₦ 1 = € 0.0018 </h2>
            </div>

            <div className="p-4 rounded-xl! bg-gray-25">
              <Text size="sm" fw={500} mb={6} className="text-body-text-100!">
                Exchange: <span className="font-bold!">SELL</span>{" "}
                <span className="text-red-500">*</span>
              </Text>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CurrencySelector
                  value={form.values.sellCurrency}
                  onChange={(value) => form.setFieldValue("sellCurrency", value)}
                />
                <TextInput
                  value="1"
                  readOnly
                  radius="md"
                  className="flex-1 min-w-35"
                  classNames={{ input: "text-xl! font-bold! text-start!" }}
                  styles={{
                    input: {
                      background: "transparent",
                      border: "none",
                      boxShadow: "none",
                      padding: 0,
                      height: "fit-content",
                    },
                  }}
                />
                <ActionIcon
                  className="h-15! w-15! rounded-full!"
                  variant="filled"
                  color="dark"
                  onClick={handleSwapConversion}
                  aria-label="Swap conversion"
                  disabled={updateRateMutation.isPending}
                >
                  <div className="flex items-center rounded-md justify-center bg-[#6d6b6e] h-5 w-5">
                    <ArrowLeftRight size={16} />
                  </div>
                </ActionIcon>
                <TextInput
                  placeholder="Naira (₦) Equivalent"
                  value={form.values.sellRateInput}
                  onChange={(e) => form.setFieldValue("sellRateInput", e.currentTarget.value)}
                  error={form.errors.sellRateInput}
                  radius="md"
                  className="flex-1 min-w-[140px]"
                  classNames={{ input: "text-xl! font-bold! text-end!" }}
                  styles={{
                    input: {
                      background: "transparent",
                      border: "none",
                      boxShadow: "none",
                      padding: 0,
                      height: "fit-content",
                    },
                  }}
                />
              </div>
              {form.errors.sellCurrency && (
                <Text c="red" size="xs" mt={6}>
                  {form.errors.sellCurrency}
                </Text>
              )}
            </div>
            <div className="flex justify-between border border-[#EEA782] bg-[#FFF6F1] rounded-2xl px-3 py-4">
              <div className="flex items-center ">
                <Image src={Cbn} alt="CBN Rate" className=" w-12" />
                <div>
                  <h4 className="text-[#DD4F05] font-medium">API: CBN Rate (€)</h4>
                  <p className="text-[#4D4B4B] text-sm font-medium italic"><span className="text-[#F63D68] font-normal">Kindly note:</span> Your buy rate can exceed 2.0% of CBN recommended rate</p>
                </div>
              </div>
              <h2 className="font-bold text-[#131212] text-base">₦ 1 = € 0.0018 </h2>
            </div>
          </Stack>
        </section>

        <Divider my="xl" />

        <section className="mb-8">
          <Text className={SECTION_TITLE_CLASS} mb={4}>
            Other Setting
          </Text>
          <Text className={SECTION_DESC_CLASS}>
            Other important currency setting that impact transaction and FX exchange
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8!">
            <Stack gap="md">
              <div>
                <DatePickerInput
                  label="Effective Start Date"
                  required
                  placeholder="Enter Start Date"
                  value={form.values.startDate}
                  onChange={(value) => form.setFieldValue("startDate", value)}
                  error={form.errors.startDate}
                  radius="md"
                  rightSection={<Calendar size={16} />}
                />
                <Text size="xs" c="dimmed" mt={6}>
                  When this rate goes live, it will affect foreign exchange transactions on the
                  system
                </Text>
              </div>
              <div>
                <TimeInput
                  label="Effective Start Time"
                  required
                  placeholder="Hour:Minutes:Seconds AM"
                  value={form.values.startTime}
                  onChange={(e) => form.setFieldValue("startTime", e.currentTarget.value)}
                  error={form.errors.startTime}
                  radius="md"
                  rightSection={<Clock size={16} />}
                />
                <Text size="xs" c="dimmed" mt={6}>
                  From the stated start time, this rate will apply to all foreign exchange
                  transactions on the system
                </Text>
              </div>
            </Stack>

            <Stack gap="md">
              <div>
                <DatePickerInput
                  label="Effective End Date"
                  required
                  placeholder="Enter End Date"
                  value={form.values.endDate}
                  onChange={(value) => form.setFieldValue("endDate", value)}
                  error={form.errors.endDate}
                  radius="md"
                  rightSection={<Calendar size={16} />}
                />
                <Text size="xs" c="dimmed" mt={6}>
                  When this rate ends, it will no longer apply to foreign exchange transactions on
                  the system.
                </Text>
              </div>
              <div>
                <TimeInput
                  label="Effective End Time"
                  required
                  placeholder="Hour:Minutes:Seconds AM"
                  value={form.values.endTime}
                  onChange={(e) => form.setFieldValue("endTime", e.currentTarget.value)}
                  error={form.errors.endTime}
                  radius="md"
                  rightSection={<Clock size={16} />}
                />
                <Text size="xs" c="dimmed" mt={6}>
                  After the stated end time, this rate will no longer apply to foreign exchange
                  transactions on the system.
                </Text>
              </div>
            </Stack>
          </div>
        </section>

        <Divider my="xl" />

        <section className="mb-8">
          <Text className={SECTION_TITLE_CLASS} mb={4}>
            Note
          </Text>
          <Text className={SECTION_DESC_CLASS}>For documentation and approval processes</Text>

          <div>
            <Textarea
              label="Justification Note (Optional)"
              placeholder="Start Typing"
              value={form.values.note}
              onChange={(e) => form.setFieldValue("note", e.currentTarget.value)}
              minRows={4}
              radius="md"
            />
            <Text size="xs" c="dimmed" mt={6}>
              Optional field ({justificationWordCount} word{justificationWordCount === 1 ? "" : "s"}
              )
            </Text>
          </div>
        </section>

        <Group justify="center" wrap="nowrap" gap="sm" mt="xl">
          <CustomButton
            fullWidth
            size="lg"
            buttonType="secondary"
            onClick={handleCancel}
            disabled={updateRateMutation.isPending}
          >
            Cancel
          </CustomButton>
          <CustomButton
            fullWidth
            size="lg"
            buttonType="primary"
            onClick={handleSaveClick}
            disabled={updateRateMutation.isPending}
          >
            Save
          </CustomButton>
        </Group>
      </div>

      <ConfirmationModal
        opened={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Save Changes ?"
        message="Are you sure, save and update this changes? Kindly note that this new changes would override the existing data."
        primaryButtonText="Yes, Save and Update Changes"
        secondaryButtonText="No, Close"
        onPrimary={handleConfirmUpdate}
        onSecondary={() => setIsConfirmOpen(false)}
        loading={updateRateMutation.isPending}
      />

      <SuccessModal
        opened={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="New Changes Saved"
        message="New Changes has been successfully Saved and Updated"
        primaryButtonText="Manage Rate"
        onPrimaryClick={handleSuccessManageRate}
        secondaryButtonText="No, Close"
        onSecondaryClick={() => setIsSuccessOpen(false)}
      />
    </div>
  );
}
