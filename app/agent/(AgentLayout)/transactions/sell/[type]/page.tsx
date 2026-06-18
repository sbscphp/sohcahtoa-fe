"use client";

import { useRouter, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useAgentTransactionStep } from "@/app/agent/_hooks/use-agent-transaction-step";
import CustomStepper from "@/app/(customer)/_components/common/CustomStepper";
import {
  type TransactionStep,
  getStepsForTransactionType,
  STEP_LABELS,
} from "@/app/(customer)/_utils/transaction-flow";
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
import { AgentCustomerSelectStep } from "@/app/agent/(AgentLayout)/transactions/_components/AgentCustomerSelectStep";
import { AgentAddCustomerModal } from "@/app/agent/(AgentLayout)/transactions/_components/AgentAddCustomerModal";
import type { CustomerInterface } from "../../constant";
import { useUploadDocuments } from "@/app/(customer)/_hooks/use-document-upload";
import { useCreateData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";
import { mapUITypeToAPIType } from "@/app/(customer)/_utils/transaction-document-requirements";
import { getDocumentUploadSpec } from "@/app/(customer)/_utils/transaction-document-upload-spec";
import {
  buildTransactionPayload,
  toTransactionDocuments,
  type TransactionFormDataBag,
} from "@/app/(customer)/_utils/transaction-payload";
import { handleApiError } from "@/app/_lib/api/error-handler";
import { notifications } from "@mantine/notifications";

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

type AgentSellTransactionStep = "select-customer" | TransactionStep;

export default function AgentSellTransactionCreationPage() {
  const router = useRouter();
  const params = useParams();
  const type = (params?.type as string) || "resident";
  const flowType = SELL_TYPE_MAP[type as keyof typeof SELL_TYPE_MAP] ?? "resident";

  const steps = useMemo(() => {
    const overrides = STEP_LABEL_OVERRIDES[flowType];
    const base = getStepsForTransactionType(flowType)
      .map((value) => ({
        label: overrides?.[value] ?? STEP_LABELS[value],
        value,
      }));
    return [{ label: "Select Customer", value: "select-customer" as AgentSellTransactionStep }, ...base];
  }, [flowType]);

  const [activeStep, setActiveStep] = useAgentTransactionStep(
    `/agent/transactions/sell/${type}`
  );
  const [confirmationOpened, setConfirmationOpened] = useState(false);
  const [addCustomerOpened, setAddCustomerOpened] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerInterface | null>(null);
  const selectedCustomerKycPrefill = useMemo(
    () => ({
      bvn: selectedCustomer?.bvn ?? "",
      ninNumber: selectedCustomer?.nin ?? "",
    }),
    [selectedCustomer?.bvn, selectedCustomer?.nin]
  );
  const lockSelectedCustomerKyc = Boolean(
    selectedCustomer?.bvn?.trim() || selectedCustomer?.nin?.trim()
  );

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

  const uploadDocuments = useUploadDocuments();
  const createTransaction = useCreateData(agentApi.transactions.create);

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
    const customerId = selectedCustomer?.userId;

    if (!transactionType || !customerId || !uploadDocumentsData || !transactionAmountData) {
      setConfirmationOpened(false);
      notifications.show({
        title: "Error",
        message: "Please select a customer to create a transaction on their behalf",
        color: "red",
      });
      setActiveStep("select-customer");
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
            userId: customerId,
            documentType: spec.documentTypes,
          })
        : [];
      const documents = toTransactionDocuments(uploaded);
      const payload = buildTransactionPayload(transactionType, bag, documents, "SELL");

      const created = await createTransaction.mutateAsync({
        ...payload,
        userId: customerId,
      });

      setConfirmationOpened(false);
      const transactionId = (created as unknown as { data: { transactionId: string } })?.data
        ?.transactionId;
      router.push(
        transactionId
          ? `/agent/transactions/detail/${transactionId}`
          : "/agent/transactions"
      );
    } catch (error) {
      handleApiError(error);
      setConfirmationOpened(false);
    }
  };

  const handleBack = () => {
    if (activeStep === "amount") setActiveStep("upload-documents");
    else if (activeStep === "upload-documents") setActiveStep("select-customer");
    else if (activeStep === "pickup-point") setActiveStep("amount");
  };

  const renderFlowStep = () => {
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
                  : (selectedCustomerKycPrefill as Partial<ExpatriateUploadDocumentsFormData>)
              }
              onSubmit={handleUploadDocumentsSubmit}
              onBack={handleBack}
              lockKycPrefill={lockSelectedCustomerKyc}
              omitLoggedInUserKyc
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

    switch (activeStep) {
      case "upload-documents":
        return (
          <ResidentUploadDocumentsStep
            initialValues={
              uploadDocumentsData
                ? (uploadDocumentsData as ResidentUploadDocumentsFormData)
                : (selectedCustomerKycPrefill as Partial<ResidentUploadDocumentsFormData>)
            }
            onSubmit={handleUploadDocumentsSubmit}
            onBack={handleBack}
            lockKycPrefill={lockSelectedCustomerKyc}
            omitLoggedInUserKyc
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
  };

  const renderStepContent = () => {
    if (activeStep === "select-customer") {
      return (
        <AgentCustomerSelectStep
          onSubmit={(customer) => {
            setSelectedCustomer(customer);
            setActiveStep("upload-documents");
          }}
          onAddCustomer={() => setAddCustomerOpened(true)}
          selectedCustomer={selectedCustomer}
        />
      );
    }
    return renderFlowStep();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl md:p-8 p-2 w-full md:max-w-[800px] mx-auto">
        <CustomStepper steps={steps} activeStep={activeStepIndex} className="mb-6" />
        <div className="bg-white rounded-xl md:p-4 p-2">{renderStepContent()}</div>
      </div>
      {(() => {
        let title = "Initiate Sell FX?";
        let description = "Are you sure you want to initiate this sell transaction?";
        if (flowType === "touring-nigeria") {
          title = "Initiate Sell FX: Tourist?";
          description = "Are you sure you want to initiate this tourist sell transaction?";
        } else if (flowType === "expatriate") {
          title = "Initiate Sell FX: Expatriate?";
          description = "Are you sure you want to initiate this expatriate sell transaction?";
        }
        return (
          <ConfirmationModal
        opened={confirmationOpened}
        onClose={() => setConfirmationOpened(false)}
        title={title}
        description={description}
        requireInfoConfirmation
        confirmLabel="Create Transaction"
        cancelLabel="No, Close"
        onConfirm={handleConfirmInitiate}
        loading={uploadDocuments.isPending || createTransaction.isPending}
          />
        );
      })()}

      <AgentAddCustomerModal
        opened={addCustomerOpened}
        onClose={() => setAddCustomerOpened(false)}
      />
    </div>
  );
}
