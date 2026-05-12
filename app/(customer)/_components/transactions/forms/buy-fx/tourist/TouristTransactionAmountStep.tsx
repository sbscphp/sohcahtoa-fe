"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Button } from "@mantine/core";
import CurrencyAmountInput from "../../../../forms/CurrencyAmountInput";
import { CURRENCIES, getCurrencyByCode } from "@/app/(customer)/_lib/currency";
import { HugeiconsIcon } from "@hugeicons/react";
import { CoinsSwapFreeIcons } from "@hugeicons/core-free-icons";
import { isAmountOverRequiredAmount } from "../../amount-step-utils";
import ProofOfFundPrompt from "../../ProofOfFundPrompt";
import ProofOfFundModal from "../../../../modals/ProofOfFundModal";
import { useTransactionRateCalculator } from "@/app/(customer)/_hooks/use-transaction-rate";
import { notifications } from "@mantine/notifications";

const transactionAmountSchema = z.object({
  receiveAmount: z.string().min(1, "Amount is required"),
  receiveCurrency: z.string().min(1, "Currency is required"),
  sendAmount: z.string().min(1, "Amount is required"),
  sendCurrency: z.string().min(1, "Currency is required"),
  exchangeRate: z.string().optional(),
  proofOfFundsFiles: z.custom<File[]>().optional(),
});

export type TouristTransactionAmountFormData = z.infer<typeof transactionAmountSchema>;

interface TouristTransactionAmountStepProps {
  initialValues?: Partial<TouristTransactionAmountFormData>;
  onSubmit: (data: TouristTransactionAmountFormData) => void;
  onBack?: () => void;
  exchangeRate?: string;
}

export default function TouristTransactionAmountStep({
  initialValues,
  onSubmit,
  onBack,
  exchangeRate = "USD1 - NGN1500",
}: TouristTransactionAmountStepProps) {
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [proofOfFundsFiles, setProofOfFundsFiles] = useState<File[]>(
    initialValues?.proofOfFundsFiles ?? []
  );
  const form = useForm<TouristTransactionAmountFormData>({
    mode: "uncontrolled",
    initialValues: {
      receiveAmount: initialValues?.receiveAmount || "",
      receiveCurrency: initialValues?.receiveCurrency || "USD",
      sendAmount: initialValues?.sendAmount || "",
      sendCurrency: initialValues?.sendCurrency || "NGN",
      exchangeRate: initialValues?.exchangeRate || exchangeRate,
      proofOfFundsFiles: initialValues?.proofOfFundsFiles ?? [],
    },
    validate: zod4Resolver(transactionAmountSchema),
  });
  const { displayRate, recalculate } = useTransactionRateCalculator({
    getValues: () => form.values,
    setSendAmount: (value) => form.setFieldValue("sendAmount", value),
    setExchangeRateLabel: (label) => form.setFieldValue("exchangeRate", label),
    defaultLabel: exchangeRate,
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit({
      ...values,
      proofOfFundsFiles,
    });
  });

  const handleSwap = () => {
    form.setValues({
      receiveAmount: form.values.sendAmount,
      receiveCurrency: form.values.sendCurrency,
      sendAmount: form.values.receiveAmount,
      sendCurrency: form.values.receiveCurrency,
    });
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
        <div className="flex flex-col items-start p-6 gap-3 w-full bg-[#F9F9F9] rounded-3xl">
          <CurrencyAmountInput
            label="You Get Exactly"
            value={form.values.receiveAmount}
            onChange={(value) => {
              form.setFieldValue("receiveAmount", value);
              recalculate(value);
            }}
            currency={getCurrencyByCode(form.values.receiveCurrency) ?? CURRENCIES[0]}
            currencies={CURRENCIES}
            onCurrencyChange={(c) => {
              form.setFieldValue("receiveCurrency", c.code);
              recalculate(undefined, c.code);
            }}
            placeholder="0"
            error={form.errors.receiveAmount?.toString() || undefined}
          />
          <ProofOfFundPrompt
            show={isAmountOverRequiredAmount(
              form.values.receiveAmount,
              form.values.receiveCurrency,
              form.values.sendAmount,
              form.values.sendCurrency
            )}
            onUploadClick={() => setProofModalOpen(true)}
          />
        </div>


        <div className="flex justify-center -my-4 relative z-10">
          <button
            type="button"
            // onClick={handleSwap}
            onClick={() => {
              notifications.show({
                title: "Swap currencies",
                message: "Swap currencies not supported for this transaction",
                color: "blue",
              });
            }}
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
              onChange={(value) => {
                form.setFieldValue("sendAmount", value);
              }}
              currency={getCurrencyByCode(form.values.sendCurrency) ?? CURRENCIES[0]}
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
        >
          Next
        </Button>
      </div>


      <ProofOfFundModal
          opened={proofModalOpen}
          onClose={() => setProofModalOpen(false)}
          onAttach={(files: File[]) => {
            setProofOfFundsFiles(files);
            setProofModalOpen(false);
          }}
        />
    </form>
  );
}
