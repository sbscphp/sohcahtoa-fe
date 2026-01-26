"use client";

import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { Button, TextInput } from "@mantine/core";
import SelectableOptionCard from "@/app/(customer)/_components/forms/SelectableOptionCard";
import { IMTOAlert } from "./IMTOAlert";
import type { IMTOProvider } from "./IMTOSelectStep";
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowMoveDownRightIcon } from "@hugeicons/core-free-icons";

const schema = z.object({
  referenceNumber: z.string().min(1, "Reference number is required"),
  senderName: z.string().min(1, "Sender's name is required"),
});

export type IMTOReferenceFormData = z.infer<typeof schema>;

interface IMTOReferenceStepProps {
  provider: IMTOProvider;
  initialValues?: Partial<IMTOReferenceFormData>;
  onSubmit: (data: IMTOReferenceFormData) => void;
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

export default function IMTOReferenceStep({
  provider,
  initialValues,
  onSubmit,
  onBack,
}: IMTOReferenceStepProps) {
  const form = useForm<IMTOReferenceFormData>({
    mode: "uncontrolled",
    initialValues: {
      referenceNumber: initialValues?.referenceNumber ?? "",
      senderName: initialValues?.senderName ?? "",
    },
    validate: zod4Resolver(schema),
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-body-heading-300 text-2xl font-semibold leading-7">
          How would you like to receive your funds?
        </h2>
        <p className="text-[#6C6969]">
          Select your preferred option
        </p>
      </div>

    <div className="flex items-center justify-center">
    <IMTOAlert />
    </div>

      <div className="space-y-3">
        <SelectableOptionCard
          icon={provider === "moneygram" ? MONEYGRAM_LOGO : WESTERN_UNION_LOGO}
          title={provider === "moneygram" ? "MoneyGram" : "Western Union"}
          isSelected
          onClick={() => {}}
        />

       <div className="flex items-start gap-5 w-full">
       <HugeiconsIcon icon={ArrowMoveDownRightIcon} size={30} className="text-text-300" />
       <div className="space-y-4 w-full">
          <TextInput
            label="Reference Number"
            required
            size="md"
            placeholder="Enter Reference Number"
            classNames={{ label: "text-sm! font-medium! text-[#6C6969]!", input: "text-sm! font-medium! text-[#6C6969]!" }}
            {...form.getInputProps("referenceNumber")}
          />
          <p className="text-xs text-[#8F8B8B] -mt-2">
            Provide your IMTO reference number. The system will automatically
            retrieve your transaction details.
          </p>
          <TextInput
            label="Sender's Name"
            required
            size="md"
            placeholder="Enter Sender's Name"
            classNames={{ label: "text-sm! font-medium! text-[#6C6969]!", input: "text-sm! font-medium! text-[#6C6969]!" }}
            {...form.getInputProps("senderName")}
          />
        </div>
       </div>
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
          type="submit"
          size="md"
          radius="xl"
          className="w-full sm:!w-[140px] !min-h-[44px] !font-medium !text-base !bg-primary-400 hover:!bg-primary-500"
        >
          Validate
        </Button>
      </div>
    </form>
  );
}
