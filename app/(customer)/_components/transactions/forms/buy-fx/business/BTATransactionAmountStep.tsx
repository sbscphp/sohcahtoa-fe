"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Button } from "@mantine/core";
import CurrencyAmountInput from "../../../../forms/CurrencyAmountInput";
import { CURRENCIES, getCurrencyByCode } from "@/app/(customer)/_lib/currency";
import { HugeiconsIcon } from "@hugeicons/react";
import { CoinsSwapFreeIcons } from "@hugeicons/core-free-icons";
import { useTransactionRateCalculator } from "@/app/(customer)/_hooks/use-transaction-rate";

const MAX_PTA_BTA_AMOUNT = 4000;

const transactionAmountSchema = z
  .object({
    receiveAmount: z.string().min(1, "Amount is required"),
    receiveCurrency: z.string().min(1, "Currency is required"),
    sendAmount: z.string().min(1, "Amount is required"),
    sendCurrency: z.string().min(1, "Currency is required"),
    exchangeRate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const parsedAmount = Number.parseFloat(data.receiveAmount.replaceAll(",", ""));
    if (Number.isFinite(parsedAmount) && parsedAmount > MAX_PTA_BTA_AMOUNT) {
      ctx.addIssue({
        code: "custom",
        path: ["receiveAmount"],
        message: `Maximum amount is ${MAX_PTA_BTA_AMOUNT.toLocaleString()}`,
      });
    }
  });

export type BTATransactionAmountFormData = z.infer<typeof transactionAmountSchema>;

interface BTATransactionAmountStepProps {
  initialValues?: Partial<BTATransactionAmountFormData>;
  onSubmit: (data: BTATransactionAmountFormData) => void;
  onBack?: () => void;
  exchangeRate?: string;
}

export default function BTATransactionAmountStep({
  initialValues,
  onSubmit,
  onBack,
  exchangeRate = "USD1 - NGN1500",
}: BTATransactionAmountStepProps) {
  const form = useForm<BTATransactionAmountFormData>({
    mode: "uncontrolled",
    initialValues: {
      receiveAmount: initialValues?.receiveAmount || "",
      receiveCurrency: initialValues?.receiveCurrency || "USD",
      sendAmount: initialValues?.sendAmount || "",
      sendCurrency: initialValues?.sendCurrency || "NGN",
      exchangeRate: initialValues?.exchangeRate || exchangeRate,
    },
    validate: zod4Resolver(transactionAmountSchema),
  });

  const { displayRate, recalculate } = useTransactionRateCalculator({
    getValues: () => form.values,
    setSendAmount: (value) => form.setFieldValue("sendAmount", value),
    setExchangeRateLabel: (label) => form.setFieldValue("exchangeRate", label),
    defaultLabel: exchangeRate,
  });

  const capAmount = (value: string): string => {
    const parsedAmount = Number.parseFloat(value.replaceAll(",", ""));
    if (!Number.isFinite(parsedAmount)) return value;
    if (parsedAmount <= MAX_PTA_BTA_AMOUNT) return value;
    return String(MAX_PTA_BTA_AMOUNT);
  };

  const nextDisabled =
    !form.values.receiveAmount?.trim() ||
    !form.values.sendAmount?.trim();

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values);
  });

  const handleSwap = () => {
    const currentReceive = form.values.receiveAmount;
    const currentSend = form.values.sendAmount;
    const currentReceiveCurrency = form.values.receiveCurrency;
    const currentSendCurrency = form.values.sendCurrency;
    const cappedReceiveAmount = capAmount(currentSend);

    form.setValues({
      receiveAmount: cappedReceiveAmount,
      receiveCurrency: currentSendCurrency,
      sendAmount: currentReceive,
      sendCurrency: currentReceiveCurrency,
    });
    recalculate(cappedReceiveAmount, currentSendCurrency);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-2 justify-center items-center">
        <h2 className="text-body-heading-300 text-2xl font-semibold">
          Transaction Amount
        </h2>
        <p className="text-body-text-200 text-base max-w-md text-center">
          Fill In accurate transaction amount and currency to continue
        </p>
      </div>

      <div className="w-full flex flex-col items-stretch">
        <div className="flex flex-col items-center p-6 gap-6 w-full bg-[#F9F9F9] rounded-3xl">
          <CurrencyAmountInput
            label="You Get Exactly"
            value={form.values.receiveAmount}
            onChange={(value) => {
              const cappedValue = capAmount(value);
              form.setFieldValue("receiveAmount", cappedValue);
              recalculate(cappedValue);
            }}
            currency={
              getCurrencyByCode(form.values.receiveCurrency) ?? CURRENCIES[0]
            }
            currencies={CURRENCIES}
            onCurrencyChange={(c) => {
              form.setFieldValue("receiveCurrency", c.code ?? CURRENCIES[0].code);
              recalculate(undefined, c.code ?? CURRENCIES[0].code);
            }}
            placeholder="0"
            error={form.errors.receiveAmount?.toString() || undefined}
          />
        </div>

        <div className="flex justify-center -my-4 relative z-10">
          <button
            type="button"
            onClick={handleSwap}
            className="w-12 h-12 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center transition-colors shadow-md"
            aria-label="Swap currencies"
          >
            <HugeiconsIcon icon={CoinsSwapFreeIcons} size={24} className="text-white" />
          </button>
        </div>

        <div className="flex flex-col w-full">
          <div className="flex flex-col items-center p-6 gap-6 w-full bg-[#F9F9F9] rounded-t-3xl">
            <CurrencyAmountInput
              label="When you send"
              value={form.values.sendAmount}
              onChange={(value) => form.setFieldValue("sendAmount", value)}
              currency={
                getCurrencyByCode(form.values.sendCurrency ?? CURRENCIES[0].code) ?? CURRENCIES[0]
              }
              placeholder="0"
              error={form.errors.sendAmount?.toString() || undefined}
              showDropdown={false}
              disabled
            />
          </div>
          <div className="flex flex-row justify-between items-center py-4 px-6 gap-6 w-full h-14 bg-black rounded-b-3xl">
            <span className="font-normal text-base leading-6 text-white">Exchange Rate</span>
            <span className="font-normal text-base leading-6 text-white">{displayRate}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center w-full">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            size="md"
            radius="xl"
            className="border-gray-200! text-body-text-200! w-full sm:w-[188px]! min-h-[48px] h-[48px]!"
            onClick={onBack}
          >
            Back
          </Button>
        )}
        <Button
          type="submit"
          variant="filled"
          size="md"
          radius="xl"
          className="w-full sm:w-[188px]! min-h-[48px] h-[48px]!"
          disabled={nextDisabled}
        >
          Next
        </Button>
      </div>
    </form>
  );
}
