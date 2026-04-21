"use client";

import CustomStepper from "@/app/(customer)/_components/common/CustomStepper";
import { ConfirmationModal } from "@/app/(customer)/_components/modals/ConfirmationModal";
import { getBuyFxInitiateNotices } from "@/app/(customer)/_lib/transaction-initiate-notices";
import type { BTATransactionAmountFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/business/BTATransactionAmountStep";
import BTATransactionAmountStep from "@/app/(customer)/_components/transactions/forms/buy-fx/business/BTATransactionAmountStep";
import type { BTAUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/business/BTAUploadDocumentsStep";
import BTAUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/business/BTAUploadDocumentsStep";
import type { MedicalBankDetailsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/medical/MedicalBankDetailsStep";
import MedicalBankDetailsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/medical/MedicalBankDetailsStep";
import type { MedicalTransactionAmountFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/medical/MedicalTransactionAmountStep";
import MedicalTransactionAmountStep from "@/app/(customer)/_components/transactions/forms/buy-fx/medical/MedicalTransactionAmountStep";
import type { MedicalUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/medical/MedicalUploadDocumentsStep";
import MedicalUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/medical/MedicalUploadDocumentsStep";
import type { ProfessionalBodyBankDetailsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/professional-body/ProfessionalBodyBankDetailsStep";
import ProfessionalBodyBankDetailsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/professional-body/ProfessionalBodyBankDetailsStep";
import type { ProfessionalBodyTransactionAmountFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/professional-body/ProfessionalBodyTransactionAmountStep";
import ProfessionalBodyTransactionAmountStep from "@/app/(customer)/_components/transactions/forms/buy-fx/professional-body/ProfessionalBodyTransactionAmountStep";
import type { ProfessionalBodyUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/professional-body/ProfessionalBodyUploadDocumentsStep";
import ProfessionalBodyUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/professional-body/ProfessionalBodyUploadDocumentsStep";
import type { SchoolFeesBankDetailsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/school-fees/SchoolFeesBankDetailsStep";
import SchoolFeesBankDetailsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/school-fees/SchoolFeesBankDetailsStep";
import type { SchoolFeesTransactionAmountFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/school-fees/SchoolFeesTransactionAmountStep";
import SchoolFeesTransactionAmountStep from "@/app/(customer)/_components/transactions/forms/buy-fx/school-fees/SchoolFeesTransactionAmountStep";
import type { SchoolFeesUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/school-fees/SchoolFeesUploadDocumentsStep";
import SchoolFeesUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/school-fees/SchoolFeesUploadDocumentsStep";
import type { TouristTransactionAmountFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/tourist/TouristTransactionAmountStep";
import TouristTransactionAmountStep from "@/app/(customer)/_components/transactions/forms/buy-fx/tourist/TouristTransactionAmountStep";
import type { TouristUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/tourist/TouristUploadDocumentsStep";
import TouristUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/tourist/TouristUploadDocumentsStep";
import type { TransactionAmountFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/vacation/PTATransactionAmountStep";
import PTATransactionAmountStep from "@/app/(customer)/_components/transactions/forms/buy-fx/vacation/PTATransactionAmountStep";
import type { UploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/vacation/PTAUploadDocumentsStep";
import PTAUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/vacation/PTAUploadDocumentsStep";
import { useUploadDocuments } from "@/app/(customer)/_hooks/use-document-upload";
import { mapUITypeToAPIType } from "@/app/(customer)/_utils/transaction-document-requirements";
import { getDocumentUploadSpec } from "@/app/(customer)/_utils/transaction-document-upload-spec";
import {
  getStepsForTransactionType,
  STEP_LABELS,
  type TransactionStep,
} from "@/app/(customer)/_utils/transaction-flow";
import {
  buildTransactionPayload,
  toTransactionDocuments,
  type TransactionFormDataBag,
} from "@/app/(customer)/_utils/transaction-payload";
import { handleApiError } from "@/app/_lib/api/error-handler";
import { useCreateData } from "@/app/_lib/api/hooks";
import { AgentAddCustomerModal } from "@/app/agent/(AgentLayout)/transactions/_components/AgentAddCustomerModal";
import { AgentCustomerSelectStep } from "@/app/agent/(AgentLayout)/transactions/_components/AgentCustomerSelectStep";
import { agentApi } from "@/app/agent/_services/agent-api";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CustomerInterface } from "../constant";
import { notifications } from "@mantine/notifications";

const TRANSACTION_TYPE_MAP = {
  vacation: "pta",
  business: "business",
  "school-fees": "school-fees",
  medical: "medical",
  "professional-body": "professional-body",
  tourist: "tourist",
} as const;

type AgentTransactionStep = "select-customer" | TransactionStep;

export default function AgentTransactionCreationPage() {
  const router = useRouter();
  const params = useParams();
  const type = (params?.type as string) || "vacation";
  const flowType = TRANSACTION_TYPE_MAP[type as keyof typeof TRANSACTION_TYPE_MAP] ?? "pta";
  const isBTA = type === "business";
  const isSchoolFees = type === "school-fees";
  const isMedical = type === "medical";
  const isProfessionalBody = type === "professional-body";
  const isTourist = type === "tourist";

  const steps = useMemo(
    () => {
      const base = getStepsForTransactionType(flowType)
        .filter((value) => value !== "pickup-point")
        .map((value) => ({
          label: STEP_LABELS[value],
          value,
        }));
      return [{ label: "Select Customer", value: "select-customer" as AgentTransactionStep }, ...base];
    },
    [flowType]
  );

  const [activeStep, setActiveStep] = useState<AgentTransactionStep>("select-customer");
  const [confirmationOpened, setConfirmationOpened] = useState(false);
  const [addCustomerOpened, setAddCustomerOpened] = useState(false);

  const [uploadDocumentsData, setUploadDocumentsData] = useState<
    | UploadDocumentsFormData
    | BTAUploadDocumentsFormData
    | SchoolFeesUploadDocumentsFormData
    | MedicalUploadDocumentsFormData
    | ProfessionalBodyUploadDocumentsFormData
    | TouristUploadDocumentsFormData
    | null
  >(null);
  const [transactionAmountData, setTransactionAmountData] = useState<
    | TransactionAmountFormData
    | BTATransactionAmountFormData
    | SchoolFeesTransactionAmountFormData
    | MedicalTransactionAmountFormData
    | ProfessionalBodyTransactionAmountFormData
    | TouristTransactionAmountFormData
    | null
  >(null);
  const [bankDetailsData, setBankDetailsData] = useState<
    | SchoolFeesBankDetailsFormData
    | MedicalBankDetailsFormData
    | ProfessionalBodyBankDetailsFormData
    | null
  >(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerInterface | null>(null);

  const uploadDocuments = useUploadDocuments();
  const createTransaction = useCreateData(agentApi.transactions.create);

  const activeStepIndex = steps.findIndex((s) => s.value === activeStep);

  const handleUploadDocumentsSubmit = (
    data:
      | UploadDocumentsFormData
      | BTAUploadDocumentsFormData
      | SchoolFeesUploadDocumentsFormData
      | MedicalUploadDocumentsFormData
      | ProfessionalBodyUploadDocumentsFormData
      | TouristUploadDocumentsFormData
  ) => {
    setUploadDocumentsData(data);
    setActiveStep("amount");
  };

  const handleTransactionAmountSubmit = (
    data:
      | TransactionAmountFormData
      | BTATransactionAmountFormData
      | SchoolFeesTransactionAmountFormData
      | MedicalTransactionAmountFormData
      | ProfessionalBodyTransactionAmountFormData
      | TouristTransactionAmountFormData
  ) => {
    setTransactionAmountData(data);
    if (isSchoolFees || isMedical || isProfessionalBody) {
      setActiveStep("bank-details");
    } else {
      setConfirmationOpened(true);
    }
  };

  const handleBankDetailsSubmit = (
    data:
      | SchoolFeesBankDetailsFormData
      | MedicalBankDetailsFormData
      | ProfessionalBodyBankDetailsFormData
  ) => {
    setBankDetailsData(data);
    setConfirmationOpened(true);
  };

  const handleConfirmInitiate = async () => {
    if (uploadDocuments.isPending || createTransaction.isPending) return;
    const transactionType = mapUITypeToAPIType(flowType);

    // Agent must select a customer to create a transaction on their behalf
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
      pickupPointData: null,
      bankDetailsData: bankDetailsData ? (bankDetailsData as Record<string, unknown>) : null,
    };

    if ((isSchoolFees || isMedical || isProfessionalBody) && !bankDetailsData) {
      setConfirmationOpened(false);
      notifications.show({
        title: "Error",
        message: "Please fill in the bank details to continue",
        color: "red",
      });
      return;
    }

    try {
      const spec = getDocumentUploadSpec(
        transactionType,
        bag.uploadDocumentsData,
        bag.bankDetailsData
      );
      const uploaded = spec
        ? await uploadDocuments.mutateAsync({
            file: spec.files,
            userId: customerId,
            documentType: spec.documentTypes,
          })
        : [];
      const documents = toTransactionDocuments(uploaded);
      const payload = buildTransactionPayload(transactionType, bag, documents);
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
    if (activeStep === "amount") {
      setActiveStep("upload-documents");
    } else if (activeStep === "bank-details") {
      setActiveStep("amount");
    } else if (activeStep === "select-customer") {
      router.push("/agent/transactions/new/buy");
    } else {
      setActiveStep("select-customer");
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
          onBack={handleBack}
          selectedCustomer={selectedCustomer as any}
        />
      );
    }
    if (isTourist) {
      switch (activeStep) {
        case "upload-documents":
          return (
            <TouristUploadDocumentsStep
              initialValues={
                uploadDocumentsData
                  ? (uploadDocumentsData as Partial<TouristUploadDocumentsFormData>)
                  : undefined
              }
              onSubmit={handleUploadDocumentsSubmit}
              onBack={handleBack}
            />
          );
        case "amount":
          return (
            <TouristTransactionAmountStep
              initialValues={transactionAmountData || undefined}
              onSubmit={handleTransactionAmountSubmit}
              onBack={handleBack}
            />
          );
        default:
          return null;
      }
    }

    if (isProfessionalBody) {
      switch (activeStep) {
        case "upload-documents":
          return (
            <ProfessionalBodyUploadDocumentsStep
              initialValues={
                uploadDocumentsData
                  ? (uploadDocumentsData as Partial<ProfessionalBodyUploadDocumentsFormData>)
                  : undefined
              }
              onSubmit={handleUploadDocumentsSubmit}
              onBack={handleBack}
            />
          );
        case "amount":
          return (
            <ProfessionalBodyTransactionAmountStep
              initialValues={transactionAmountData || undefined}
              onSubmit={handleTransactionAmountSubmit}
              onBack={handleBack}
            />
          );
        case "bank-details":
          return (
            <ProfessionalBodyBankDetailsStep
              initialValues={bankDetailsData || undefined}
              onSubmit={handleBankDetailsSubmit}
              onBack={handleBack}
            />
          );
        default:
          return null;
      }
    }

    if (isMedical) {
      switch (activeStep) {
        case "upload-documents":
          return (
            <MedicalUploadDocumentsStep
              initialValues={uploadDocumentsData || undefined}
              onSubmit={handleUploadDocumentsSubmit}
              onBack={handleBack}
            />
          );
        case "amount":
          return (
            <MedicalTransactionAmountStep
              initialValues={transactionAmountData || undefined}
              onSubmit={handleTransactionAmountSubmit}
              onBack={handleBack}
            />
          );
        case "bank-details":
          return (
            <MedicalBankDetailsStep
              initialValues={bankDetailsData || undefined}
              onSubmit={handleBankDetailsSubmit}
              onBack={handleBack}
            />
          );
        default:
          return null;
      }
    }

    if (isSchoolFees) {
      switch (activeStep) {
        case "upload-documents":
          return (
            <SchoolFeesUploadDocumentsStep
              initialValues={
                uploadDocumentsData
                  ? (uploadDocumentsData as Partial<SchoolFeesUploadDocumentsFormData>)
                  : undefined
              }
              onSubmit={handleUploadDocumentsSubmit}
              onBack={handleBack}
            />
          );
        case "amount":
          return (
            <SchoolFeesTransactionAmountStep
              initialValues={transactionAmountData || undefined}
              onSubmit={handleTransactionAmountSubmit}
              onBack={handleBack}
            />
          );
        case "bank-details":
          return (
            <SchoolFeesBankDetailsStep
              initialValues={bankDetailsData || undefined}
              onSubmit={handleBankDetailsSubmit}
              onBack={handleBack}
            />
          );
        default:
          return null;
      }
    }

    if (isBTA) {
      switch (activeStep) {
        case "upload-documents":
          return (
            <BTAUploadDocumentsStep
              initialValues={uploadDocumentsData || undefined}
              onSubmit={handleUploadDocumentsSubmit}
              onBack={handleBack}
            />
          );
        case "amount":
          return (
            <BTATransactionAmountStep
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
          <PTAUploadDocumentsStep
            initialValues={uploadDocumentsData || undefined}
            onSubmit={handleUploadDocumentsSubmit}
            onBack={handleBack}
          />
        );
      case "amount":
        return (
          <PTATransactionAmountStep
            initialValues={transactionAmountData || undefined}
            onSubmit={handleTransactionAmountSubmit}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  const confirmTitle = isProfessionalBody
    ? "Initiate Professional Fee Transaction request?"
    : isMedical
      ? "Initiate Medical Fee Transaction request?"
      : isSchoolFees
        ? "Initiate School Fees Transaction request?"
        : isBTA
          ? "Initiate BTA Transaction request?"
          : isTourist
            ? "Initiate Tourist Transaction request?"
            : "Initiate PTA Transaction request?";

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl md:p-8 p-2 w-full md:max-w-[800px] mx-auto">
          <CustomStepper steps={steps} activeStep={activeStepIndex} className="mb-6" />
          <div className="bg-white rounded-xl md:p-4 p-2">{renderStepContent()}</div>
        </div>

        <ConfirmationModal
          opened={confirmationOpened}
          onClose={() => setConfirmationOpened(false)}
          title={confirmTitle}
          notices={getBuyFxInitiateNotices(flowType)}
          confirmLabel="Yes, Initiate Request"
          cancelLabel="No, Close"
          onConfirm={handleConfirmInitiate}
          requireInfoConfirmation
          loading={uploadDocuments.isPending || createTransaction.isPending}
        />
      </div>

      <AgentAddCustomerModal
        opened={addCustomerOpened}
        onClose={() => setAddCustomerOpened(false)}
      />
    </>
  );
}
