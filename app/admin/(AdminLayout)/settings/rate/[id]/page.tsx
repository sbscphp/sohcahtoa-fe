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
  Menu,
  Button,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { Calendar, Clock, ArrowLeftRight, ChevronDown, Pencil, CheckCheck, Eye } from "lucide-react";
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
import {
  buildApiDateTimeIso,
  splitApiDateTimeForInput,
} from "@/app/utils/helper/formatLocalDate";
import RateTakeActionOverlay from "./RateTakeActionOverlay";

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

function buildRatePayload(values: RateFormValues): CreateRatePayload | null {
  const buyRate = parseRateValue(values.buyRateInput);
  const sellRate = parseRateValue(values.sellRateInput);
  const validFrom = buildApiDateTimeIso(values.startDate, values.startTime);
  const validUntil = buildApiDateTimeIso(values.endDate, values.endTime);

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

function prefillFromDetail(detail: RateDetailsData): RateFormValues {
  const start = splitApiDateTimeForInput(detail.validFrom);
  const end = splitApiDateTimeForInput(detail.validUntil);
  const buyCurrency = CURRENCIES.some((c) => c.code === detail.fromCurrency)
    ? (detail.fromCurrency as CurrencyCode)
    : null;
  const sellCurrency = CURRENCIES.some((c) => c.code === detail.toCurrency)
    ? (detail.toCurrency as CurrencyCode)
    : null;
  return {
    buyCurrency,
    buyRateInput: String(detail.buyRate ?? ""),
    sellCurrency,
    sellRateInput: String(detail.sellRate ?? ""),
    startDate: start.date,
    startTime: start.time,
    endDate: end.date,
    endTime: end.time,
    note: detail.note ?? "",
  };
}

export default function RateDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const rateId = params?.id ?? "";
  const hasPrefilledRef = useRef(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isTakeActionOpen, setIsTakeActionOpen] = useState(false);
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
        return buildApiDateTimeIso(values.startDate, value) ? null : "Enter a valid start time";
      },
      endDate: (value) => (value ? null : "Effective end date is required"),
      endTime: (value, values) => {
        if (!value.trim()) return "Effective end time is required";
        const validUntil = buildApiDateTimeIso(values.endDate, value);
        if (!validUntil) return "Enter a valid end time";
        const validFrom = buildApiDateTimeIso(values.startDate, values.startTime);
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
    form.setValues(prefillFromDetail(rateDetailQuery.data.data));
    hasPrefilledRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rateDetailQuery.data]);

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

  const rateDetail = rateDetailQuery.data?.data;
  const rateStatus = rateDetail?.status ?? undefined;
  const isApproved = rateDetail?.isApproved ?? false;
  const isPendingApproval = rateStatus === "PENDING_APPROVAL";
  const isApprovalOfficer = rateDetail?.approvalProcess?.isApprovalOfficer ?? false;
  const approvalState = rateDetail?.approvalProcess?.approvalState;
  const workflowStages = rateDetail?.approvalProcess?.workflowStages ?? [];

  const showCompleteReview = isPendingApproval;
  const showViewUpdates = isApproved && !isPendingApproval;

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

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    if (isEditMode && rateDetailQuery.data?.data) {
      form.setValues(prefillFromDetail(rateDetailQuery.data.data));
      form.clearErrors();
      setIsEditMode(false);
    } else {
      router.push(adminRoutes.adminSettingsRates());
    }
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
    setIsEditMode(false);
  };

  if (!rateId) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <Text c="red" mb="md">
          Invalid rate id. Please select a valid rate.
        </Text>
        <CustomButton buttonType="secondary" onClick={() => router.push(adminRoutes.adminSettingsRates())}>
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
          <CustomButton buttonType="secondary" onClick={() => router.push(adminRoutes.adminSettingsRates())}>
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
      {/* Page header with Actions dropdown */}
      <Group justify="flex-end" mb="md">
        <Menu shadow="md" width={220} position="bottom-end" withinPortal>
          <Menu.Target>
            <Button
              variant="outline"
              color="dark"
              radius="xl"
              rightSection={<ChevronDown size={16} />}
            >
              Actions
            </Button>
          </Menu.Target>

          <Menu.Dropdown className="rounded-xl! border border-gray-50 p-1!">
            <Menu.Item
              leftSection={<Pencil size={16} />}
              onClick={handleEditClick}
              disabled={isEditMode}
            >
              Edit
            </Menu.Item>

            {showCompleteReview && (
              <Menu.Item
                leftSection={<CheckCheck size={16} />}
                onClick={() => setIsTakeActionOpen(true)}
              >
                Complete Review
              </Menu.Item>
            )}

            {showViewUpdates && (
              <Menu.Item
                leftSection={<Eye size={16} />}
                onClick={() => setIsTakeActionOpen(true)}
              >
                View Updates
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </Group>

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
                  disabled={!isEditMode}
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
                  disabled={!isEditMode || updateRateMutation.isPending}
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
                  readOnly={!isEditMode}
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

            <div className="p-4 rounded-xl! bg-gray-25">
              <Text size="sm" fw={500} mb={6} className="text-body-text-100!">
                Exchange: <span className="font-bold!">SELL</span>{" "}
                <span className="text-red-500">*</span>
              </Text>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CurrencySelector
                  value={form.values.sellCurrency}
                  onChange={(value) => form.setFieldValue("sellCurrency", value)}
                  disabled={!isEditMode}
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
                  disabled={!isEditMode || updateRateMutation.isPending}
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
                  readOnly={!isEditMode}
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
                  readOnly={!isEditMode}
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
                  readOnly={!isEditMode}
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
                  readOnly={!isEditMode}
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
                  readOnly={!isEditMode}
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
              readOnly={!isEditMode}
            />
            <Text size="xs" c="dimmed" mt={6}>
              Optional field ({justificationWordCount} word{justificationWordCount === 1 ? "" : "s"}
              )
            </Text>
          </div>
        </section>

        {isEditMode && (
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
        )}
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
        primaryButtonText="Done"
        onPrimaryClick={handleSuccessManageRate}
        secondaryButtonText="No, Close"
        onSecondaryClick={() => setIsSuccessOpen(false)}
      />

      <RateTakeActionOverlay
        opened={isTakeActionOpen}
        onClose={() => setIsTakeActionOpen(false)}
        rateId={rateId}
        rateStatus={rateStatus}
        isApprovalOfficer={isApprovalOfficer}
        approvalState={approvalState}
        workflowStages={workflowStages}
      />
    </div>
  );
}
