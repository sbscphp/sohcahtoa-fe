"use client";

import { useRouter, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import CustomStepper from "@/app/(customer)/_components/common/CustomStepper";
import {
  type TransactionStep,
  getStepsForTransactionType,
  STEP_LABELS,
} from "@/app/(customer)/_utils/transaction-flow";
import PTAUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/vacation/PTAUploadDocumentsStep";
import PTATransactionAmountStep from "@/app/(customer)/_components/transactions/forms/buy-fx/vacation/PTATransactionAmountStep";
import PTAPickupPointStep from "@/app/(customer)/_components/transactions/forms/buy-fx/vacation/PTAPickupPointStep";
import BTAUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/business/BTAUploadDocumentsStep";
import BTATransactionAmountStep from "@/app/(customer)/_components/transactions/forms/buy-fx/business/BTATransactionAmountStep";
import BTAPickupPointStep from "@/app/(customer)/_components/transactions/forms/buy-fx/business/BTAPickupPointStep";
import SchoolFeesUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/school-fees/SchoolFeesUploadDocumentsStep";
import SchoolFeesTransactionAmountStep from "@/app/(customer)/_components/transactions/forms/buy-fx/school-fees/SchoolFeesTransactionAmountStep";
import SchoolFeesBankDetailsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/school-fees/SchoolFeesBankDetailsStep";
import MedicalUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/medical/MedicalUploadDocumentsStep";
import MedicalTransactionAmountStep from "@/app/(customer)/_components/transactions/forms/buy-fx/medical/MedicalTransactionAmountStep";
import MedicalBankDetailsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/medical/MedicalBankDetailsStep";
import ProfessionalBodyUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/professional-body/ProfessionalBodyUploadDocumentsStep";
import ProfessionalBodyTransactionAmountStep from "@/app/(customer)/_components/transactions/forms/buy-fx/professional-body/ProfessionalBodyTransactionAmountStep";
import ProfessionalBodyBankDetailsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/professional-body/ProfessionalBodyBankDetailsStep";
import TouristUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/tourist/TouristUploadDocumentsStep";
import TouristTransactionAmountStep from "@/app/(customer)/_components/transactions/forms/buy-fx/tourist/TouristTransactionAmountStep";
import TouristPickupPointStep from "@/app/(customer)/_components/transactions/forms/buy-fx/tourist/TouristPickupPointStep";
import { ConfirmationModal } from "@/app/(customer)/_components/modals/ConfirmationModal";
import type { UploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/vacation/PTAUploadDocumentsStep";
import type { TransactionAmountFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/vacation/PTATransactionAmountStep";
import type { PickupPointFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/vacation/PTAPickupPointStep";
import type { BTAUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/business/BTAUploadDocumentsStep";
import type { BTATransactionAmountFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/business/BTATransactionAmountStep";
import type { BTAPickupPointFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/business/BTAPickupPointStep";
import type { SchoolFeesUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/school-fees/SchoolFeesUploadDocumentsStep";
import type { SchoolFeesTransactionAmountFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/school-fees/SchoolFeesTransactionAmountStep";
import type { SchoolFeesBankDetailsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/school-fees/SchoolFeesBankDetailsStep";
import type { MedicalUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/medical/MedicalUploadDocumentsStep";
import type { MedicalTransactionAmountFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/medical/MedicalTransactionAmountStep";
import type { MedicalBankDetailsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/medical/MedicalBankDetailsStep";
import type { ProfessionalBodyUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/professional-body/ProfessionalBodyUploadDocumentsStep";
import type { ProfessionalBodyTransactionAmountFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/professional-body/ProfessionalBodyTransactionAmountStep";
import type { ProfessionalBodyBankDetailsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/professional-body/ProfessionalBodyBankDetailsStep";
import type { TouristUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/tourist/TouristUploadDocumentsStep";
import type { TouristTransactionAmountFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/tourist/TouristTransactionAmountStep";
import type { TouristPickupPointFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/tourist/TouristPickupPointStep";

const TRANSACTION_TYPE_MAP = {
  vacation: "pta",
  business: "business",
  "school-fees": "school-fees",
  medical: "medical",
  "professional-body": "professional-body",
  tourist: "tourist",
} as const;

export default function TransactionCreationPage() {
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
    () =>
      getStepsForTransactionType(flowType).map((value) => ({
        label: STEP_LABELS[value],
        value,
      })),
    [flowType]
  );

  const [activeStep, setActiveStep] = useState<TransactionStep>("upload-documents");
  const [confirmationOpened, setConfirmationOpened] = useState(false);

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
  const [pickupPointData, setPickupPointData] = useState<
    PickupPointFormData | BTAPickupPointFormData | TouristPickupPointFormData | null
  >(null);
  const [bankDetailsData, setBankDetailsData] = useState<
    | SchoolFeesBankDetailsFormData
    | MedicalBankDetailsFormData
    | ProfessionalBodyBankDetailsFormData
    | null
  >(null);

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
    setActiveStep(
      isSchoolFees || isMedical || isProfessionalBody
        ? "bank-details"
        : "pickup-point"
    );
  };

  const handlePickupPointSubmit = (
    data: PickupPointFormData | BTAPickupPointFormData | TouristPickupPointFormData
  ) => {
    setPickupPointData(data);
    setConfirmationOpened(true);
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

  const handleConfirmInitiate = () => {
    console.log("Transaction data:", {
      type: isBTA
        ? "BTA"
        : isSchoolFees
          ? "School Fees"
          : isMedical
            ? "Medical"
            : isProfessionalBody
              ? "Professional Fee"
              : isTourist
                ? "Tourist"
                : "PTA",
      uploadDocuments: uploadDocumentsData,
      transactionAmount: transactionAmountData,
      pickupPoint: pickupPointData,
      bankDetails: bankDetailsData,
    });
    router.push("/dashboard");
  };

  const handleBack = () => {
    if (activeStep === "amount") {
      setActiveStep("upload-documents");
    } else if (activeStep === "pickup-point" || activeStep === "bank-details") {
      setActiveStep("amount");
    } else {
      router.push("/transactions/new/buy");
    }
  };

  const renderStepContent = () => {
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
        case "pickup-point":
          return (
            <TouristPickupPointStep
              initialValues={pickupPointData || undefined}
              onSubmit={handlePickupPointSubmit}
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
        case "pickup-point":
          return (
            <BTAPickupPointStep
              initialValues={pickupPointData || undefined}
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
      case "pickup-point":
        return (
          <PTAPickupPointStep
            initialValues={pickupPointData || undefined}
            onSubmit={handlePickupPointSubmit}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  const confirmTitle = isProfessionalBody
    ? "Initiate Professional Fee?"
    : isMedical
      ? "Initiate Medical Fee?"
      : isSchoolFees
        ? "Initiate School Fees?"
        : isBTA
          ? "Initiate BTA?"
          : isTourist
            ? "Initiate Tourist?"
            : "Initiate PTA?";
  const confirmDescription = isProfessionalBody
    ? "Are you sure you want to initiate this professional fee transaction?"
    : isMedical
      ? "Are you sure you want to initiate this medical fee transaction?"
      : isSchoolFees
        ? "Are you sure you want to initiate this school fees transaction?"
        : isBTA
          ? "Are you sure you want to initiate a new BTA?"
          : isTourist
            ? "Are you sure you want to initiate this tourist transaction?"
            : "Are you sure you want to initiate a new PTA?";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl md:p-8 p-2 w-full md:max-w-[800px] mx-auto">
        <CustomStepper steps={steps} activeStep={activeStepIndex} className="mb-6" />
        <div className="bg-white rounded-xl md:p-4 p-2">{renderStepContent()}</div>
      </div>

      <ConfirmationModal
        opened={confirmationOpened}
        onClose={() => setConfirmationOpened(false)}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel="View Transaction"
        cancelLabel="No, Close"
        onConfirm={handleConfirmInitiate}
      />
    </div>
  );
}
