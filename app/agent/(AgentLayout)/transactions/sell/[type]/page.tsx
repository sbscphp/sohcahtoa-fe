"use client";

import { useRouter, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import CustomStepper from "@/app/(customer)/_components/common/CustomStepper";
import {
  type TransactionStep,
  getStepsForTransactionType,
  STEP_LABELS,
} from "@/app/(customer)/_utils/transaction-flow";
import ResidentUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/sell-fx/resident/ResidentUploadDocumentsStep";
import ResidentTransactionAmountStep from "@/app/(customer)/_components/transactions/forms/sell-fx/resident/ResidentTransactionAmountStep";
import TouringNigeriaUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/sell-fx/touring-nigeria/TouringNigeriaUploadDocumentsStep";
import ExpatriateUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/sell-fx/expatriate/ExpatriateUploadDocumentsStep";
import { ConfirmationModal } from "@/app/(customer)/_components/modals/ConfirmationModal";
import type { ResidentUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/resident/ResidentUploadDocumentsStep";
import type { ResidentTransactionAmountFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/resident/ResidentTransactionAmountStep";
import type { TouringNigeriaUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/touring-nigeria/TouringNigeriaUploadDocumentsStep";
import type { ExpatriateUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/expatriate/ExpatriateUploadDocumentsStep";

const SELL_TYPE_MAP = {
  resident: "resident",
  "touring-nigeria": "touring-nigeria",
  expatriate: "expatriate",
} as const;

const STEP_LABEL_OVERRIDES: Partial<
  Record<(typeof SELL_TYPE_MAP)[keyof typeof SELL_TYPE_MAP], Record<string, string>>
> = {
  "touring-nigeria": { "pickup-point": "Drop Off Point" },
};

export default function AgentSellTransactionCreationPage() {
  const router = useRouter();
  const params = useParams();
  const type = (params?.type as string) || "resident";
  const flowType = SELL_TYPE_MAP[type as keyof typeof SELL_TYPE_MAP] ?? "resident";

  const steps = useMemo(() => {
    const overrides = STEP_LABEL_OVERRIDES[flowType];
    return getStepsForTransactionType(flowType)
      .filter((value) => value !== "pickup-point")
      .map((value) => ({
        label: overrides?.[value] ?? STEP_LABELS[value],
        value,
      }));
  }, [flowType]);

  const [activeStep, setActiveStep] = useState<TransactionStep>("upload-documents");
  const [confirmationOpened, setConfirmationOpened] = useState(false);

  const [uploadDocumentsData, setUploadDocumentsData] = useState<
    | ResidentUploadDocumentsFormData
    | TouringNigeriaUploadDocumentsFormData
    | ExpatriateUploadDocumentsFormData
    | null
  >(null);
  const [transactionAmountData, setTransactionAmountData] =
    useState<ResidentTransactionAmountFormData | null>(null);

  const activeStepIndex = steps.findIndex((s) => s.value === activeStep);

  const handleUploadDocumentsSubmit = (
    data:
      | ResidentUploadDocumentsFormData
      | TouringNigeriaUploadDocumentsFormData
      | ExpatriateUploadDocumentsFormData
  ) => {
    setUploadDocumentsData(data);
    setActiveStep("amount");
  };

  const handleTransactionAmountSubmit = (data: ResidentTransactionAmountFormData) => {
    setTransactionAmountData(data);
    setConfirmationOpened(true);
  };

  const handleConfirmInitiate = () => {
    console.log("Sell transaction data:", {
      flowType,
      uploadDocuments: uploadDocumentsData,
      transactionAmount: transactionAmountData,
    });
    router.push("/agent/dashboard");
  };

  const handleBack = () => {
    if (activeStep === "amount") setActiveStep("upload-documents");
    else router.push("/agent/transactions/new/sell");
  };

  const renderStepContent = () => {
    if (flowType === "touring-nigeria") {
      switch (activeStep) {
        case "upload-documents":
          return (
            <TouringNigeriaUploadDocumentsStep
              initialValues={uploadDocumentsData as TouringNigeriaUploadDocumentsFormData | undefined}
              onSubmit={handleUploadDocumentsSubmit}
              onBack={handleBack}
            />
          );
        case "amount":
          return (
            <ResidentTransactionAmountStep
              initialValues={transactionAmountData || undefined}
              onSubmit={handleTransactionAmountSubmit}
              onBack={handleBack}
            />
          );
        default:
          return null;
      }
    }
    if (flowType === "expatriate") {
      switch (activeStep) {
        case "upload-documents":
          return (
            <ExpatriateUploadDocumentsStep
              initialValues={uploadDocumentsData as ExpatriateUploadDocumentsFormData | undefined}
              onSubmit={handleUploadDocumentsSubmit}
              onBack={handleBack}
            />
          );
        case "amount":
          return (
            <ResidentTransactionAmountStep
              initialValues={transactionAmountData || undefined}
              onSubmit={handleTransactionAmountSubmit}
              onBack={handleBack}
            />
          );
        default:
          return null;
      }
    }
    switch (activeStep) {
      case "upload-documents":
        return (
          <ResidentUploadDocumentsStep
            initialValues={uploadDocumentsData as ResidentUploadDocumentsFormData | undefined}
            onSubmit={handleUploadDocumentsSubmit}
            onBack={handleBack}
          />
        );
      case "amount":
        return (
          <ResidentTransactionAmountStep
            initialValues={transactionAmountData || undefined}
            onSubmit={handleTransactionAmountSubmit}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl md:p-8 p-2 w-full md:max-w-[800px] mx-auto">
        <CustomStepper steps={steps} activeStep={activeStepIndex} className="mb-6" />
        <div className="bg-white rounded-xl md:p-4 p-2">{renderStepContent()}</div>
      </div>
      <ConfirmationModal
        opened={confirmationOpened}
        onClose={() => setConfirmationOpened(false)}
        title={
          flowType === "touring-nigeria"
            ? "Initiate Sell FX: Tourist?"
            : flowType === "expatriate"
              ? "Initiate Sell FX: Expatriate?"
              : "Initiate Sell FX?"
        }
        description={
          flowType === "touring-nigeria"
            ? "Are you sure you want to initiate this tourist sell transaction?"
            : flowType === "expatriate"
              ? "Are you sure you want to initiate this expatriate sell transaction?"
              : "Are you sure you want to initiate this sell transaction?"
        }
        requireInfoConfirmation
        confirmLabel="View Transaction"
        cancelLabel="No, Close"
        onConfirm={handleConfirmInitiate}
      />
    </div>
  );
}
