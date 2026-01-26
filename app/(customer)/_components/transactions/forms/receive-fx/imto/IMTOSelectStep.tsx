"use client";

import { Button } from "@mantine/core";
import SelectableOptionCard from "@/app/(customer)/_components/forms/SelectableOptionCard";
import { IMTOAlert } from "./IMTOAlert";

export type IMTOProvider = "moneygram" | "western-union";

interface IMTOSelectStepProps {
  selectedImto: IMTOProvider | null;
  onSelect: (imto: IMTOProvider) => void;
  onSubmit: () => void;
  onBack?: () => void;
}

const MONEYGRAM_LOGO = (
  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-600 font-bold text-lg">
    G
  </div>
);
const WESTERN_UNION_LOGO = (
  <div className="w-10 h-10 rounded-lg bg-yellow-400/20 flex items-center justify-center text-yellow-700 font-bold text-lg">
    W
  </div>
);

export default function IMTOSelectStep({
  selectedImto,
  onSelect,
  onSubmit,
  onBack,
}: IMTOSelectStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-[#4D4B4B] text-2xl font-semibold leading-7">
          Select IMTO Options
        </h2>
        <p className="text-[#6C6969]">
          Select your preferred option
        </p>
      </div>

    <div className="flex items-center justify-center">
    <IMTOAlert />
    </div>

      <div className="flex flex-col gap-3">
        <SelectableOptionCard
          icon={MONEYGRAM_LOGO}
          title="MoneyGram"
          isSelected={selectedImto === "moneygram"}
          onClick={() => onSelect("moneygram")}
        />
        <SelectableOptionCard
          icon={WESTERN_UNION_LOGO}
          title="Western Union"
          isSelected={selectedImto === "western-union"}
          onClick={() => onSelect("western-union")}
        />
      </div>

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
          disabled={!selectedImto}
        >
          Validate
        </Button>
      </div>
    </div>
  );
}
