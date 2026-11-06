"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NumberInput, Select, Textarea } from "@mantine/core";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { adminRoutes } from "@/lib/adminRoutes";
import { DISBURSE_CASH_AGENTS } from "../_data/fxInventoryMock";

const CURRENCIES = [
  { value: "NGN", label: "NGN" },
  { value: "USD", label: "USD" },
];

const disburseCashSchema = z.object({
  agent: z.string().min(1, "Agent is required"),
  amount: z.number({ message: "Amount is required" }).min(1, "Amount must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  purpose: z.string().optional(),
});

type DisburseCashFormValues = z.infer<typeof disburseCashSchema>;

export default function DisburseCashPage() {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DisburseCashFormValues>({
    resolver: zodResolver(disburseCashSchema),
    defaultValues: {
      agent: "",
      currency: "NGN",
      purpose: "",
    },
  });

  const currency = useWatch({ control, name: "currency" });
  const amountPrefix = currency === "USD" ? "$ " : "₦ ";

  const returnToInventory = () => {
    router.push(adminRoutes.adminSettlementFxInventory());
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
                data={DISBURSE_CASH_AGENTS}
                value={field.value}
                onChange={(value) => field.onChange(value ?? "")}
                error={errors.agent?.message}
                radius="md"
              />
            )}
          />

          <div>
            <p className="mb-1 text-sm font-medium text-gray-900">Amount</p>
            <div className="flex items-start gap-2">
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
                    error={errors.amount?.message}
                    radius="md"
                  />
                )}
              />
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select
                    data={CURRENCIES}
                    value={field.value}
                    onChange={(value) => field.onChange(value ?? "NGN")}
                    w={110}
                    radius="md"
                    allowDeselect={false}
                    aria-label="Currency"
                  />
                )}
              />
            </div>
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
        onPrimary={() => {
          setConfirmOpen(false);
          setSuccessOpen(true);
        }}
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
