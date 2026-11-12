"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NumberInput, Select, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateData } from "@/app/_lib/api/hooks";
import type { ApiError, ApiResponse } from "@/app/_lib/api/client";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import CurrencySelector from "@/app/admin/_components/CurrencySelector";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import type { Currency } from "@/app/admin/_lib/constants";
import { getCurrencySymbol } from "@/app/admin/_lib/currency";
import { adminApi } from "@/app/admin/_services/admin-api";
import { useAgentsAll } from "@/app/admin/(AdminLayout)/outlet/hooks/useAgentsAll";
import { adminRoutes } from "@/lib/adminRoutes";

type CurrencyCode = Currency["code"];

const disburseCashSchema = z.object({
  agent: z.string().min(1, "Agent is required"),
  amount: z.number({ message: "Amount is required" }).min(1, "Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  purpose: z.string().optional(),
});

type DisburseCashFormValues = z.infer<typeof disburseCashSchema>;

export default function DisburseCashPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const {
    agentOptions,
    isLoading: isAgentsLoading,
    isError: isAgentsError,
  } = useAgentsAll();

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<DisburseCashFormValues>({
    resolver: zodResolver(disburseCashSchema),
    defaultValues: {
      agent: "",
      currency: "NGN",
      purpose: "",
    },
  });

  const createDisbursement = useCreateData(adminApi.fxInventory.createDisbursement, {
    onSuccess: () => {
      setConfirmOpen(false);
      setSuccessOpen(true);
      void queryClient.invalidateQueries({ queryKey: [...adminKeys.fxInventory.all] });
    },
    onError: (error) => {
      const apiResponse = (error as unknown as ApiError).data as ApiResponse | undefined;
      notifications.show({
        title: "Disbursement Failed",
        message:
          apiResponse?.error?.message ??
          error.message ??
          "Unable to create this disbursement. Please try again.",
        color: "red",
      });
    },
  });

  const currency = useWatch({ control, name: "currency" });
  const amountPrefix = `${getCurrencySymbol(currency || "NGN")} `;

  const returnToInventory = () => {
    router.push(adminRoutes.adminSettlementFxInventory());
  };

  const handleConfirm = () => {
    const values = getValues();
    const purpose = values.purpose?.trim();
    createDisbursement.mutate({
      agentId: values.agent,
      amount: values.amount,
      currency: values.currency,
      ...(purpose ? { purpose } : {}),
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl py-4">
      <form
        className="rounded-2xl bg-white px-8 py-10 shadow-sm"
        onSubmit={handleSubmit(() => setConfirmOpen(true))}
      >
        <div className="mb-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900">Disburse Cash</h2>
          <p className="mt-1 text-sm text-gray-500">
            Fill out the form to disburse cash to a specific agent
          </p>
        </div>

        <div className="space-y-5">
          <Controller
            name="agent"
            control={control}
            render={({ field }) => (
              <Select
                label="Agent"
                withAsterisk
                placeholder="Select agent"
                data={agentOptions}
                value={field.value}
                onChange={(value) => field.onChange(value ?? "")}
                error={
                  isAgentsError
                    ? "Unable to load agents. Please try again later."
                    : errors.agent?.message
                }
                radius="md"
                searchable
                disabled={isAgentsLoading || isAgentsError || agentOptions.length === 0}
              />
            )}
          />

          <div>
            <p className="mb-1 text-sm font-medium text-gray-900">Amount</p>
            <div
              className={`flex items-center gap-2 rounded-md border bg-white px-3 py-1 focus-within:border-primary-400 ${
                errors.amount ? "border-red-500" : "border-gray-200"
              }`}
            >
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    className="flex-1"
                    placeholder="0.00"
                    prefix={amountPrefix}
                    thousandSeparator=","
                    decimalScale={2}
                    hideControls
                    value={field.value}
                    onChange={(value) => field.onChange(typeof value === "number" ? value : undefined)}
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
                )}
              />
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <div className="shrink-0">
                    <CurrencySelector
                      value={field.value as CurrencyCode}
                      onChange={field.onChange}
                    />
                  </div>
                )}
              />
            </div>
            {errors.amount?.message ? (
              <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>
            ) : null}
          </div>

          <Controller
            name="purpose"
            control={control}
            render={({ field }) => (
              <Textarea
                label="Purpose"
                placeholder="Enter purpose of disbursement here"
                minRows={4}
                value={field.value ?? ""}
                onChange={field.onChange}
                radius="md"
              />
            )}
          />
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <CustomButton buttonType="secondary" onClick={returnToInventory}>
            Cancel
          </CustomButton>
          <CustomButton buttonType="primary" type="submit">
            Disburse Cash
          </CustomButton>
        </div>
      </form>

      <ConfirmationModal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Disburse Cash?"
        message="Are you sure you want to send this money to the selected agent? This disbursement will go through approval before agent can be funded."
        primaryButtonText="Yes, Continue"
        secondaryButtonText="No, Close"
        loading={createDisbursement.isPending}
        onPrimary={handleConfirm}
        onSecondary={() => setConfirmOpen(false)}
      />

      <SuccessModal
        opened={successOpen}
        onClose={returnToInventory}
        title="Cash Disbursement Request"
        message="A request has been created for this disbursement. You will be notified once an admin has confirmed this cash disbursement."
        primaryButtonText="Okay."
        onPrimaryClick={returnToInventory}
      />
    </div>
  );
}
