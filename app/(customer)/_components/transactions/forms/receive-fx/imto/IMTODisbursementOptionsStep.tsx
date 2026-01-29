"use client";

import { Button, TextInput } from "@mantine/core";
import SelectableOptionCard from "@/app/(customer)/_components/forms/SelectableOptionCard";
import { IMTOAlert } from "./IMTOAlert";
import ExchangeSummaryCard from "./ExchangeSummaryCard";

export type DisbursementOption = "full-naira" | "usd-cash-pickup";

interface IMTODisbursementOptionsStepProps {
  amountSentUsd: string;
  amountReceiveNgn: string;
  exchangeRate?: string;
  selectedOption: DisbursementOption | null;
  usdCashAmount: string;
  amountLeftNgn: string;
  onSelectOption: (option: DisbursementOption) => void;
  onUsdCashAmountChange: (value: string) => void;
  onSubmit: () => void;
  onBack?: () => void;
}

export default function IMTODisbursementOptionsStep({
  amountSentUsd,
  amountReceiveNgn,
  exchangeRate = "USD1 - NGN1500",
  selectedOption,
  usdCashAmount,
  amountLeftNgn,
  onSelectOption,
  onUsdCashAmountChange,
  onSubmit,
  onBack,
}: IMTODisbursementOptionsStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-[#4D4B4B] text-2xl font-semibold leading-7">
          How would you like to receive your funds?
        </h2>
        <p className="text-[#6C6969]">
          Select your preferred option
        </p>
      </div>

    <div className="flex items-center justify-center">
    <IMTOAlert />
    </div>

      <div className="flex flex-col gap-3">
        {selectedOption === "full-naira" ? (
          <div className="w-full flex justify-center">
            <ExchangeSummaryCard
              amountSent={amountSentUsd}
              amountSentEquivalent={amountReceiveNgn}
              amountReceive={amountReceiveNgn}
              exchangeRate={exchangeRate}
            />
          </div>
        ) : (
          <SelectableOptionCard
            title="Convert full amount to naira"
            description="The full amount will be converted to naira equivalent and you can select how you want it."
            isSelected={false}
            onClick={() => onSelectOption("full-naira")}
          />
        )}
        <SelectableOptionCard
          title="Request USD cash pick up"
          description="A portion of the amount will be available for cash pickup in USD, and the rest will be sent as a bank transfer."
          isSelected={selectedOption === "usd-cash-pickup"}
          onClick={() => onSelectOption("usd-cash-pickup")}
        />
      </div>



      {selectedOption === "usd-cash-pickup" && (
        <div className="rounded-lg border border-gray-100 bg-gray-50/30 p-4 space-y-2">
          <TextInput
            label="Enter Amount (USD)"
            size="md"
            placeholder="Enter amount"
            value={usdCashAmount}
            onChange={(e) => onUsdCashAmountChange(e.target.value)}
            classNames={{ label: "text-sm font-medium text-[#6C6969]" }}
          />
          <p className="text-xs text-[#8F8B8B]">
            Amount left (NGN):{" "}
            <span className="font-semibold text-primary-400">{amountLeftNgn}</span>
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            radius="xl"
            className="!flex !items-center !justify-center !px-6 !py-3.5 w-full sm:!w-[138px] !min-h-[48px] !bg-white !border !border-text-50 !rounded-full !font-medium !text-base !leading-6 !text-[#4D4B4B]"
            onClick={onBack}
          >
            Back
          </Button>
        )}
        <Button
          type="button"
          size="md"
          radius="xl"
          className="w-full sm:!w-[140px] !min-h-[44px] !font-medium !text-base !bg-primary-400 hover:!bg-primary-500"
          onClick={onSubmit}
          disabled={!selectedOption}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
