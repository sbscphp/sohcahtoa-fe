"use client";

import { Alert, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { Info } from "lucide-react";
import DomiciliaryAccountFields from "@/app/(customer)/_components/transactions/forms/DomiciliaryAccountFields";
import {
  domiciliaryAccountInitialValues,
  domiciliaryAccountSchema,
  type DomiciliaryAccountFormData,
} from "@/app/(customer)/_lib/domiciliary-account-schema";
import { SELL_REFUND_DOMICILIARY_MESSAGE } from "@/app/(customer)/_lib/compliance-messaging";

/** Local (unsaved) or previously mapped domiciliary refund account. */
export type DomiciliaryRefundAccount = DomiciliaryAccountFormData & { id?: string };

interface DomiciliaryRefundBankStepProps {
  initialValues?: Partial<DomiciliaryAccountFormData>;
  onSubmit: (account: DomiciliaryAccountFormData) => void;
  onBack?: () => void;
}

export default function DomiciliaryRefundBankStep({
  initialValues,
  onSubmit,
  onBack,
}: Readonly<DomiciliaryRefundBankStepProps>) {
  const form = useForm({
    initialValues: domiciliaryAccountInitialValues(initialValues),
    validate: zod4Resolver(domiciliaryAccountSchema),
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-2 justify-center items-center">
        <h2 className="text-body-heading-300 text-2xl font-semibold">Refund Bank Details</h2>
        <p className="text-body-text-200 text-base max-w-md text-center">
          Enter your domiciliary (foreign currency) bank account for refunds if your transaction
          cannot be processed.
        </p>
      </div>

      <Alert icon={<Info size={14} />} title="" className="bg-white! border-gray-300!">
        <p className="text-body-text-200 text-sm">{SELL_REFUND_DOMICILIARY_MESSAGE}</p>
      </Alert>

      <DomiciliaryAccountFields
        getInputProps={form.getInputProps}
        setFieldValue={form.setFieldValue}
        clearFieldError={form.clearFieldError}
        errors={form.errors}
        showInfoAlert={false}
      />

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center w-full">
        {onBack ? (
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
        ) : null}
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
