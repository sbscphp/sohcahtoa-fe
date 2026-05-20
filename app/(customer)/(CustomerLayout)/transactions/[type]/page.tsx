"use client";

import { useRouter, useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/app/_lib/atoms/auth-atom";
import { useUploadDocuments } from "@/app/(customer)/_hooks/use-document-upload";
import { useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import CustomStepper from "@/app/(customer)/_components/common/CustomStepper";
import {
  getBuyOverThresholdProofOfFundsUploadSpec,
  getDocumentUploadSpec,
} from "@/app/(customer)/_utils/transaction-document-upload-spec";
import {
  buildTransactionPayload,
  toTransactionDocuments,
  type TransactionFormDataBag,
} from "@/app/(customer)/_utils/transaction-payload";
import { mapUITypeToAPIType } from "@/app/(customer)/_utils/transaction-document-requirements";
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
import BankAccountSelectionStep from "@/app/(customer)/_components/transactions/forms/BankAccountSelectionStep";
import { ConfirmationModal } from "@/app/(customer)/_components/modals/ConfirmationModal";
import { AddBankAccountModal } from "@/app/(customer)/_components/modals/AddBankAccountModal";
import type { AddBankAccountFormData } from "@/app/(customer)/_components/modals/AddBankAccountModal";
import type { BankAccount } from "@/app/(customer)/_components/transactions/forms/PickupPointStep";
import { useCustomerBankAccounts } from "@/app/(customer)/_hooks/use-customer-bank-accounts";
import {
  getCreatedTransactionId,
  getPickupBankAccountId,
  toCreateBankAccountPayload,
} from "@/app/(customer)/_utils/customer-bank-accounts";
import { getBuyFxInitiateNotices } from "@/app/(customer)/_lib/transaction-initiate-notices";
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
import { handleApiError } from "@/app/_lib/api/error-handler";
import { notifications } from "@mantine/notifications";

const TRANSACTION_TYPE_MAP = {
  vacation: "pta",
  business: "business",
  "school-fees": "school-fees",
  medical: "medical",
  "professional-body": "professional-body",
  tourist: "tourist",
} as const;

function getRequestedForeignAmount(
  data:
    | TransactionAmountFormData
    | BTATransactionAmountFormData
    | TouristTransactionAmountFormData
    | SchoolFeesTransactionAmountFormData
    | MedicalTransactionAmountFormData
    | ProfessionalBodyTransactionAmountFormData
    | null
) {
  const record = data as Record<string, unknown> | null;
  const rawAmount = record?.receiveAmount ?? record?.sendAmount ?? 0;
  return typeof rawAmount === "number"
    ? rawAmount
    : Number.parseFloat(String(rawAmount)) || 0;
}

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
  const usesPayoutMethod = !isSchoolFees && !isMedical && !isProfessionalBody;

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
  const [addBankOpened, setAddBankOpened] = useState(false);
  const {
    accounts: bankAccounts,
    isLoading: bankAccountsLoading,
    addAccount,
    isSaving: isSavingBankAccount,
    attachToTransaction,
  } = useCustomerBankAccounts();
  const [bankDetailsData, setBankDetailsData] = useState<
    | SchoolFeesBankDetailsFormData
    | MedicalBankDetailsFormData
    | ProfessionalBodyBankDetailsFormData
    | null
  >(null);

  const userProfile = useAtomValue(userProfileAtom);
  const uploadDocuments = useUploadDocuments();
  const createTransaction = useCreateData(customerApi.transactions.create);

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
    if (data.payoutMethod === "electronic_transfer_100") {
      setActiveStep("bank-details");
      return;
    }

    if (data.payoutMethod === "card_75_cash_25") {
      const cashAmount = getRequestedForeignAmount(transactionAmountData) * 0.25;
      if (cashAmount > 500) {
        notifications.show({
          title: "Cash limit exceeded",
          message:
            "The cash portion cannot exceed $500. Reduce the amount or choose another payout method.",
          color: "orange",
        });
        return;
      }
    }

    setConfirmationOpened(true);
  };

  const handleAddBank = useCallback(
    async (data: AddBankAccountFormData) => {
      try {
        await addAccount(toCreateBankAccountPayload(data));
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    [addAccount],
  );

  const handlePayoutBankAccountSubmit = (bankAccount: BankAccount) => {
    setPickupPointData((prev) => ({
      locationId: prev?.locationId ?? "",
      pickupDate: prev?.pickupDate ?? "",
      pickupTime: prev?.pickupTime ?? "",
      state: prev?.state,
      city: prev?.city,
      payoutMethod: prev?.payoutMethod ?? "electronic_transfer_100",
      selectedBankId: bankAccount.id,
      bankAccount,
    }));
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

  const handleConfirmInitiate = async () => {
    if (uploadDocuments.isPending || createTransaction.isPending) return;
    const transactionType = mapUITypeToAPIType(flowType);
    if (!transactionType || !userProfile?.id || !uploadDocumentsData || !transactionAmountData) {
      setConfirmationOpened(false);
      notifications.show({
        title: "Incomplete transaction",
        message: "Complete each step before confirming. Sign in again if the problem continues.",
        color: "orange",
      });
      router.push("/transactions/new/buy");
      return;
    }

    const bag: TransactionFormDataBag = {
      uploadDocumentsData: uploadDocumentsData as Record<string, unknown>,
      transactionAmountData: transactionAmountData as Record<string, unknown>,
      pickupPointData: pickupPointData ? (pickupPointData as Record<string, unknown>) : null,
      bankDetailsData: bankDetailsData ? (bankDetailsData as Record<string, unknown>) : null,
    };

    const hasPickup = usesPayoutMethod;
    if (hasPickup && !pickupPointData) {
      setConfirmationOpened(false);
      notifications.show({
        title: "Pickup location required",
        message: "Go back and select a pickup location before initiating your transaction.",
        color: "orange",
      });
      setActiveStep("pickup-point");
      return;
    }
    if (
      pickupPointData?.payoutMethod === "electronic_transfer_100" &&
      !pickupPointData.bankAccount
    ) {
      setConfirmationOpened(false);
      notifications.show({
        title: "Bank account required",
        message: "Select or add a bank account before initiating your transaction.",
        color: "orange",
      });
      setActiveStep("bank-details");
      return;
    }
    if ((isSchoolFees || isMedical || isProfessionalBody) && !bankDetailsData) {
      setConfirmationOpened(false);
      notifications.show({
        title: "Bank details required",
        message: "Go back and complete your bank details before continuing.",
        color: "orange",
      });
      setActiveStep("bank-details");
      return;
    }

    try {
      const baseSpec = getDocumentUploadSpec(
        transactionType,
        bag.uploadDocumentsData,
        bag.bankDetailsData
      );
      const overThresholdProofSpec = getBuyOverThresholdProofOfFundsUploadSpec(
        bag.transactionAmountData
      );
      const combinedSpec =
        baseSpec || overThresholdProofSpec
          ? {
              files: [
                ...(baseSpec?.files ?? []),
                ...(overThresholdProofSpec?.files ?? []),
              ],
              documentTypes: [
                ...(baseSpec?.documentTypes ?? []),
                ...(overThresholdProofSpec?.documentTypes ?? []),
              ],
            }
          : null;
      const uploaded = combinedSpec
        ? await uploadDocuments.mutateAsync({
            file: combinedSpec.files,
            userId: userProfile.id,
            documentType: combinedSpec.documentTypes,
          })
        : [];
      const documents = toTransactionDocuments(uploaded);
      const payload = buildTransactionPayload(transactionType, bag, documents, "BUY");
      const created = await createTransaction.mutateAsync(payload);
      const transactionId = getCreatedTransactionId(created);
      const bankAccountId = getPickupBankAccountId(
        pickupPointData as Record<string, unknown> | null,
      );
      if (transactionId && bankAccountId) {
        try {
          await attachToTransaction(transactionId, [bankAccountId]);
        } catch (attachError) {
          handleApiError(attachError);
          notifications.show({
            title: "Transaction created",
            message:
              "Your request was submitted, but linking the bank account failed. You can retry from transaction details.",
            color: "orange",
          });
        }
      }
      setConfirmationOpened(false);
      if (transactionId) {
        router.push(`/transactions/detail/${transactionId}`);
      } else {
        router.push("/transactions");
      }
    } catch (error) {
      handleApiError(error);
      setConfirmationOpened(false);
    }
  };

  const handleBack = () => {
    if (activeStep === "amount") {
      setActiveStep("upload-documents");
    } else if (activeStep === "bank-details" && usesPayoutMethod) {
      setActiveStep("pickup-point");
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
        case "bank-details":
          return (
            <BankAccountSelectionStep
              banks={bankAccounts}
              isLoading={bankAccountsLoading}
              initialSelectedBankId={pickupPointData?.selectedBankId}
              onSubmit={handlePayoutBankAccountSubmit}
              onBack={handleBack}
              onAddBank={() => setAddBankOpened(true)}
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
        case "bank-details": {
          const pbUpload = uploadDocumentsData as
            | ProfessionalBodyUploadDocumentsFormData
            | null;
          const memberName =
            (
              userProfile?.profile?.fullName ??
              [userProfile?.profile?.firstName, userProfile?.profile?.lastName]
                .filter(Boolean)
                .join(" ")
            ).trim() || undefined;
          return (
            <ProfessionalBodyBankDetailsStep
              initialValues={bankDetailsData || undefined}
              memberSummary={{
                memberName,
                memberNumber: pbUpload?.evidenceOfMembershipNumber || undefined,
              }}
              onSubmit={handleBankDetailsSubmit}
              onBack={handleBack}
            />
          );
        }
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
        case "bank-details":
          return (
            <BankAccountSelectionStep
              banks={bankAccounts}
              isLoading={bankAccountsLoading}
              initialSelectedBankId={pickupPointData?.selectedBankId}
              onSubmit={handlePayoutBankAccountSubmit}
              onBack={handleBack}
              onAddBank={() => setAddBankOpened(true)}
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
      case "bank-details":
        return (
          <BankAccountSelectionStep
            banks={bankAccounts}
            isLoading={bankAccountsLoading}
            initialSelectedBankId={pickupPointData?.selectedBankId}
            onSubmit={handlePayoutBankAccountSubmit}
            onBack={handleBack}
            onAddBank={() => setAddBankOpened(true)}
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
    <div className="space-y-6">
      <div className="bg-white rounded-2xl md:p-8 p-2 w-full md:max-w-[800px] mx-auto">
        <CustomStepper steps={steps} activeStep={activeStepIndex} className="mb-6" />
        <div className="bg-white rounded-xl md:p-4 p-2">{renderStepContent()}</div>
      </div>

      <ConfirmationModal
        opened={confirmationOpened}
        onClose={() => setConfirmationOpened(false)}
        title={confirmTitle}
        notices={getBuyFxInitiateNotices(flowType, {
          amount: transactionAmountData,
        })}
        confirmLabel="Yes, Initiate Request"
        cancelLabel="No, Close"
        onConfirm={handleConfirmInitiate}
        requireInfoConfirmation
        loading={uploadDocuments.isPending || createTransaction.isPending}
      />
      <AddBankAccountModal
        opened={addBankOpened}
        onClose={() => setAddBankOpened(false)}
        onAddAccount={handleAddBank}
        isSubmitting={isSavingBankAccount}
      />
    </div>
  );
}
