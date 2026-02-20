"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Button } from "@mantine/core";
import CurrencyAmountInput from "@/app/(customer)/_components/forms/CurrencyAmountInput";
import { CURRENCIES, getCurrencyByCode } from "@/app/(customer)/_lib/currency";
import { HugeiconsIcon } from "@hugeicons/react";
import { CoinsSwapFreeIcons } from "@hugeicons/core-free-icons";
import { isAmountOver10k } from "../../amount-step-utils";
import ProofOfFundPrompt from "../../ProofOfFundPrompt";
import ProofOfFundModal from "@/app/(customer)/_components/modals/ProofOfFundModal";
import SourceOfFundsDeclaration from "./SourceOfFundsDeclaration";
import type { FileWithPath } from "@mantine/dropzone";

const transactionAmountSchema = z.object({
  sendAmount: z.string().min(1, "Amount is required"),
  sendCurrency: z.string().min(1, "Currency is required"),
  receiveAmount: z.string().min(1, "Amount is required"),
  receiveCurrency: z.string().min(1, "Currency is required"),
  exchangeRate: z.string().optional(),
});

export type ResidentTransactionAmountFormData = z.infer<typeof transactionAmountSchema> & {
  sourceOfFundsSignatureMode?: "initials" | "upload";
  sourceOfFundsInitials?: string;
  sourceOfFundsSignatureFile?: FileWithPath | null;
};

interface ResidentTransactionAmountStepProps {
  initialValues?: Partial<ResidentTransactionAmountFormData>;
  onSubmit: (data: ResidentTransactionAmountFormData) => void;
  onBack?: () => void;
  exchangeRate?: string;
}

export default function ResidentTransactionAmountStep({
  initialValues,
  onSubmit,
  onBack,
  exchangeRate = "USD1 - NGN1500",
}: ResidentTransactionAmountStepProps) {
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [sourceOfFundsMode, setSourceOfFundsMode] = useState<"initials" | "upload">("initials");
  const [sourceOfFundsInitials, setSourceOfFundsInitials] = useState(initialValues?.sourceOfFundsInitials ?? "");
  const [sourceOfFundsSignatureFile, setSourceOfFundsSignatureFile] = useState<FileWithPath | null>(
    initialValues?.sourceOfFundsSignatureFile ?? null
  );
  const [sourceOfFundsError, setSourceOfFundsError] = useState<string | null>(null);

  const form = useForm<ResidentTransactionAmountFormData>({
    mode: "uncontrolled",
    initialValues: {
      sendAmount: initialValues?.sendAmount || "",
      sendCurrency: initialValues?.sendCurrency || "USD",
      receiveAmount: initialValues?.receiveAmount || "",
      receiveCurrency: initialValues?.receiveCurrency || "NGN",
      exchangeRate: initialValues?.exchangeRate || exchangeRate,
    },
    validate: zod4Resolver(transactionAmountSchema),
  });

  const over10k = isAmountOver10k(
    form.values.receiveAmount,
    form.values.receiveCurrency,
    form.values.sendAmount,
    form.values.sendCurrency
  );

  const handleSubmit = form.onSubmit((values) => {
    setSourceOfFundsError(null);
    if (over10k) {
      const hasInitials = sourceOfFundsMode === "initials" && sourceOfFundsInitials.trim().length > 0;
      const hasSignature = sourceOfFundsMode === "upload" && sourceOfFundsSignatureFile != null;
      if (!hasInitials && !hasSignature) {
        setSourceOfFundsError(
          sourceOfFundsMode === "initials"
            ? "Please enter your initials for the source of funds declaration"
            : "Please upload your signature for the source of funds declaration"
        );
        return;
      }
    }
    onSubmit({
      ...values,
      sourceOfFundsSignatureMode: over10k ? sourceOfFundsMode : undefined,
      sourceOfFundsInitials: over10k && sourceOfFundsMode === "initials" ? sourceOfFundsInitials.trim() : undefined,
      sourceOfFundsSignatureFile: over10k && sourceOfFundsMode === "upload" ? sourceOfFundsSignatureFile : undefined,
    });
  });

  const handleSwap = () => {
    const { sendAmount, sendCurrency, receiveAmount, receiveCurrency } = form.values;
    form.setValues({
      sendAmount: receiveAmount,
      sendCurrency: receiveCurrency,
      receiveAmount: sendAmount,
      receiveCurrency: sendCurrency,
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
        <div className="flex flex-col items-center p-6 gap-6 w-full bg-[#F9F9F9] rounded-3xl">
          <CurrencyAmountInput
            label="When you Send"
            value={form.values.sendAmount}
            onChange={(value) => form.setFieldValue("sendAmount", value)}
            currency={
              getCurrencyByCode(form.values.sendCurrency) ?? CURRENCIES[0]
            }
            currencies={CURRENCIES}
            onCurrencyChange={(c) => form.setFieldValue("sendCurrency", c.code)}
            placeholder="0"
            error={form.errors.sendAmount?.toString() || undefined}
          />
          <div className="w-full">
            <ProofOfFundPrompt
              show={over10k}
              onUploadClick={() => setProofModalOpen(true)}
            />
          </div>
        </div>

        {over10k && (
          <SourceOfFundsDeclaration
            signatureMode={sourceOfFundsMode}
            onSignatureModeChange={setSourceOfFundsMode}
            initialsValue={sourceOfFundsInitials}
            onInitialsChange={setSourceOfFundsInitials}
            initialsError={sourceOfFundsMode === "initials" ? (sourceOfFundsError ?? undefined) : undefined}
            signatureFile={sourceOfFundsSignatureFile}
            onSignatureFileChange={setSourceOfFundsSignatureFile}
            signatureFileError={sourceOfFundsMode === "upload" ? (sourceOfFundsError ?? undefined) : undefined}
          />
        )}

        <ProofOfFundModal
          opened={proofModalOpen}
          onClose={() => setProofModalOpen(false)}
          onAttach={(files: File[]) => {
            console.log("Proof of fund attached", files);
            setProofModalOpen(false);
          }}
        />

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
              label="You Get Exactly"
              value={form.values.receiveAmount}
              onChange={(value) => form.setFieldValue("receiveAmount", value)}
              currency={
                getCurrencyByCode(form.values.receiveCurrency) ?? CURRENCIES[0]
              }
              placeholder="0"
              error={form.errors.receiveAmount?.toString() || undefined}
              showDropdown={false}
            />
          </div>
          <div className="flex flex-row justify-between items-center py-4 px-6 gap-6 w-full h-14 bg-black rounded-b-3xl">
            <span className="font-normal text-base leading-6 text-white">
              Exchange Rate
            </span>
            <span className="font-normal text-base leading-6 text-white">
              {exchangeRate}
            </span>
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
    </form>
  );
}
