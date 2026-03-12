"use client";

import { useRouter, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/app/_lib/atoms/auth-atom";
import { useUploadDocuments } from "@/app/(customer)/_hooks/use-document-upload";
import { useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import CustomStepper from "@/app/(customer)/_components/common/CustomStepper";
import {
  type TransactionStep,
  getStepsForTransactionType,
  STEP_LABELS,
} from "@/app/(customer)/_utils/transaction-flow";
import { getDocumentUploadSpec } from "@/app/(customer)/_utils/transaction-document-upload-spec";
import {
  buildTransactionPayload,
  toTransactionDocuments,
  type TransactionFormDataBag,
} from "@/app/(customer)/_utils/transaction-payload";
import { mapUITypeToAPIType } from "@/app/(customer)/_utils/transaction-document-requirements";
import { handleApiError } from "@/app/_lib/api/error-handler";
import ResidentUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/sell-fx/resident/ResidentUploadDocumentsStep";
import ResidentTransactionAmountStep from "@/app/(customer)/_components/transactions/forms/sell-fx/resident/ResidentTransactionAmountStep";
import ResidentPickupPointStep from "@/app/(customer)/_components/transactions/forms/sell-fx/resident/ResidentPickupPointStep";
import TouringNigeriaUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/sell-fx/touring-nigeria/TouringNigeriaUploadDocumentsStep";
import TouringNigeriaDropOffPointStep from "@/app/(customer)/_components/transactions/forms/sell-fx/touring-nigeria/TouringNigeriaDropOffPointStep";
import ExpatriateUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/sell-fx/expatriate/ExpatriateUploadDocumentsStep";
import ExpatriatePickupPointStep from "@/app/(customer)/_components/transactions/forms/sell-fx/expatriate/ExpatriatePickupPointStep";
import { ConfirmationModal } from "@/app/(customer)/_components/modals/ConfirmationModal";
import type { ResidentUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/resident/ResidentUploadDocumentsStep";
import type { ResidentTransactionAmountFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/resident/ResidentTransactionAmountStep";
import type { ResidentPickupPointFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/resident/ResidentPickupPointStep";
import type { TouringNigeriaUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/touring-nigeria/TouringNigeriaUploadDocumentsStep";
import type { TouringNigeriaDropOffPointFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/touring-nigeria/TouringNigeriaDropOffPointStep";
import type { ExpatriateUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/expatriate/ExpatriateUploadDocumentsStep";
import type { ExpatriatePickupPointFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/expatriate/ExpatriatePickupPointStep";

const SELL_TYPE_MAP = {
  resident: "resident",
  "touring-nigeria": "touring-nigeria",
  expatriate: "expatriate",
} as const;

/** Step label overrides per flow (e.g. "Drop Off Point" for touring-nigeria) */
const STEP_LABEL_OVERRIDES: Partial<
  Record<typeof SELL_TYPE_MAP[keyof typeof SELL_TYPE_MAP], Record<string, string>>
> = {
  "touring-nigeria": { "pickup-point": "Drop Off Point" },
};

export default function SellTransactionCreationPage() {
  const router = useRouter();
  const params = useParams();
  const type = (params?.type as string) || "resident";
  const flowType = SELL_TYPE_MAP[type as keyof typeof SELL_TYPE_MAP] ?? "resident";

  const steps = useMemo(() => {
    const overrides = STEP_LABEL_OVERRIDES[flowType];
    return getStepsForTransactionType(flowType).map((value) => ({
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
  const [pickupPointData, setPickupPointData] = useState<
    | ResidentPickupPointFormData
    | TouringNigeriaDropOffPointFormData
    | ExpatriatePickupPointFormData
    | null
  >(null);

  const userProfile = useAtomValue(userProfileAtom);
  const uploadDocuments = useUploadDocuments();
  const createTransaction = useCreateData(customerApi.transactions.create);

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
    setActiveStep("pickup-point");
  };

  const handlePickupPointSubmit = (
    data:
      | ResidentPickupPointFormData
      | TouringNigeriaDropOffPointFormData
      | ExpatriatePickupPointFormData
  ) => {
    setPickupPointData(data);
    setConfirmationOpened(true);
  };

  const handleConfirmInitiate = async () => {
    if (uploadDocuments.isPending || createTransaction.isPending) return;

    const transactionType = mapUITypeToAPIType(flowType);
    if (!transactionType || !userProfile?.id || !uploadDocumentsData || !transactionAmountData || !pickupPointData) {
      setConfirmationOpened(false);
      router.push("/transactions");
      return;
    }

    const bag: TransactionFormDataBag = {
      uploadDocumentsData: uploadDocumentsData as Record<string, unknown>,
      transactionAmountData: transactionAmountData as Record<string, unknown>,
      pickupPointData: pickupPointData ? (pickupPointData as Record<string, unknown>) : null,
    };

    try {
      const spec = getDocumentUploadSpec(transactionType, bag.uploadDocumentsData);
      const uploaded = spec
        ? await uploadDocuments.mutateAsync({
            file: spec.files,
            userId: userProfile.id,
            documentType: spec.documentTypes,
          })
        : [];
      const documents = toTransactionDocuments(uploaded);
      const payload = buildTransactionPayload(transactionType, bag, documents);
      const created = await createTransaction.mutateAsync(payload);
      setConfirmationOpened(false);
      router.push(`/transactions/detail/${(created as { id: string }).id}`);
    } catch (error) {
      handleApiError(error);
      setConfirmationOpened(false);
    }
  };

  const handleBack = () => {
    if (activeStep === "amount") {
      setActiveStep("upload-documents");
    } else if (activeStep === "pickup-point") {
      setActiveStep("amount");
    } else {
      router.push("/transactions/new/sell");
    }
  };

  const renderStepContent = () => {
    if (flowType === "touring-nigeria") {
      switch (activeStep) {
        case "upload-documents":
          return (
            <TouringNigeriaUploadDocumentsStep
              initialValues={
                uploadDocumentsData
                  ? (uploadDocumentsData as TouringNigeriaUploadDocumentsFormData)
                  : undefined
              }
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
        case "pickup-point":
          return (
            <TouringNigeriaDropOffPointStep
              initialValues={
                pickupPointData
                  ? (pickupPointData as TouringNigeriaDropOffPointFormData)
                  : undefined
              }
              onSubmit={handlePickupPointSubmit}
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
              initialValues={
                uploadDocumentsData
                  ? (uploadDocumentsData as ExpatriateUploadDocumentsFormData)
                  : undefined
              }
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
        case "pickup-point":
          return (
            <ExpatriatePickupPointStep
              initialValues={
                pickupPointData
                  ? (pickupPointData as ExpatriatePickupPointFormData)
                  : undefined
              }
              onSubmit={handlePickupPointSubmit}
              onBack={handleBack}
            />
          );
        default:
          return null;
      }
    }

    switch (flowType) {
      case "resident":
        switch (activeStep) {
          case "upload-documents":
            return (
              <ResidentUploadDocumentsStep
                initialValues={
                  uploadDocumentsData
                    ? (uploadDocumentsData as ResidentUploadDocumentsFormData)
                    : undefined
                }
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
          case "pickup-point":
            return (
              <ResidentPickupPointStep
                initialValues={
                  pickupPointData
                    ? (pickupPointData as ResidentPickupPointFormData)
                    : undefined
                }
                onSubmit={handlePickupPointSubmit}
                onBack={handleBack}
              />
            );
          default:
            return null;
        }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl md:p-8 p-2 w-full md:max-w-200 mx-auto">
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
