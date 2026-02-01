"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import CustomStepper from "@/app/(customer)/_components/common/CustomStepper";
import IMTOSelectStep, { type IMTOProvider } from "@/app/(customer)/_components/transactions/forms/receive-fx/imto/IMTOSelectStep";
import IMTOReferenceStep from "@/app/(customer)/_components/transactions/forms/receive-fx/imto/IMTOReferenceStep";
import type { IMTOReferenceFormData } from "@/app/(customer)/_components/transactions/forms/receive-fx/imto/IMTOReferenceStep";
import IMTOReferenceDetailsStep from "@/app/(customer)/_components/transactions/forms/receive-fx/imto/IMTOReferenceDetailsStep";
import IMTODisbursementOptionsStep, {
  type DisbursementOption,
} from "@/app/(customer)/_components/transactions/forms/receive-fx/imto/IMTODisbursementOptionsStep";
import IMTOLocationBankStep from "@/app/(customer)/_components/transactions/forms/receive-fx/imto/IMTOLocationBankStep";
import { TransactionSuccessModal } from "@/app/(customer)/_components/modals/TransactionSuccessModal";

const STEP_LABELS = [
  "Select IMTO",
  "Enter Reference",
  "Reference Details",
  "Disbursement Options",
  "Location / Bank",
];

export default function ReceiveIMTOPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedImto, setSelectedImto] = useState<IMTOProvider | null>(null);
  const [referenceData, setReferenceData] = useState<IMTOReferenceFormData | null>(null);
  const [disbursementOption, setDisbursementOption] = useState<DisbursementOption | null>(null);
  const [usdCashAmount, setUsdCashAmount] = useState("");
  const [locationBankData, setLocationBankData] = useState<{
    selectedBankId: string;
    state?: string;
    city?: string;
    locationId?: string;
  } | null>(null);
  const [confirmationOpened, setConfirmationOpened] = useState(false);

  const steps = useMemo(
    () => STEP_LABELS.map((label, i) => ({ label, value: i })),
    []
  );

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
    else router.push("/transactions/options");
  };

  const amountUsd = referenceData ? "$5,000.00" : "$0";
  const amountNgn = referenceData ? "NGN 7,500,000.00" : "NGN 0";
  const amountLeftNgn = "NGN 600,000.00";

  const renderStep = () => {
    switch (stepIndex) {
      case 0:
        return (
          <IMTOSelectStep
            selectedImto={selectedImto}
            onSelect={(imto) => {
              setSelectedImto(imto);
              setStepIndex(1);
            }}
            onSubmit={() => setStepIndex(1)}
            onBack={handleBack}
          />
        );
      case 1:
        return selectedImto ? (
          <IMTOReferenceStep
            provider={selectedImto}
            initialValues={referenceData ?? undefined}
            onSubmit={(data) => {
              setReferenceData(data);
              setStepIndex(2);
            }}
            onBack={handleBack}
          />
        ) : null;
      case 2:
        return referenceData ? (
          <IMTOReferenceDetailsStep
            referenceNumber={referenceData.referenceNumber}
            senderName={referenceData.senderName}
            receiverName="Adeola Aderinsola"
            amount={amountUsd}
            onProceed={() => setStepIndex(3)}
            onBack={handleBack}
          />
        ) : null;
      case 3:
        return (
          <IMTODisbursementOptionsStep
            amountSentUsd={amountUsd}
            amountReceiveNgn={amountNgn}
            selectedOption={disbursementOption}
            usdCashAmount={usdCashAmount}
            amountLeftNgn={amountLeftNgn}
            onSelectOption={setDisbursementOption}
            onUsdCashAmountChange={setUsdCashAmount}
            onSubmit={() => setStepIndex(4)}
            onBack={handleBack}
          />
        );
      case 4:
        return disbursementOption ? (
          <IMTOLocationBankStep
            disbursementOption={disbursementOption}
            balanceAmountNgn={amountLeftNgn}
            initialValues={locationBankData ?? undefined}
            onSubmit={(data) => {
              setLocationBankData(data);
              setConfirmationOpened(true);
            }}
            onBack={handleBack}
          />
        ) : null;
      default:
        return null;
    }
  };

  const showStepperFromStep = 2;
  const stepperSteps =
    stepIndex >= showStepperFromStep
      ? [
          { label: "Disbursement Options", value: 0 },
          { label: "Location / Bank", value: 1 },
        ]
      : steps.slice(0, 3);
  const stepperActiveIndex =
    stepIndex >= showStepperFromStep
      ? stepIndex === 3
        ? 0
        : 1
      : Math.min(stepIndex, 2);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl md:p-8 p-4 w-full md:max-w-[800px] mx-auto">
        {stepIndex >= showStepperFromStep ? (
          <CustomStepper
            steps={stepperSteps as any}
            activeStep={stepperActiveIndex}
            className="mb-6"
          />
        ) : null}
        <div className="bg-white rounded-xl md:p-4 p-2">{renderStep()}</div>
      </div>

      <TransactionSuccessModal
        opened={confirmationOpened}
        onClose={() => setConfirmationOpened(false)}
        title="Transaction Completed Successfully"
        description="Your IMTO transaction has been successfully processed and your payment has been confirmed. You will receive a notification once your funds are available for collection or transfer."
        confirmLabel="View Transaction"
        onConfirm={() => router.push("/dashboard")}
      />
    </div>
  );
}
