"use client";

import CustomStepper from "@/app/(customer)/_components/common/CustomStepper";
import { ConfirmationModal } from "@/app/(customer)/_components/modals/ConfirmationModal";
import { getBuyFxInitiateNotices } from "@/app/(customer)/_lib/transaction-initiate-notices";
import type { BTATransactionAmountFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/business/BTATransactionAmountStep";
import BTATransactionAmountStep from "@/app/(customer)/_components/transactions/forms/buy-fx/business/BTATransactionAmountStep";
import type { BTAUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/business/BTAUploadDocumentsStep";
import BTAUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/business/BTAUploadDocumentsStep";
import BTAPickupPointStep from "@/app/(customer)/_components/transactions/forms/buy-fx/business/BTAPickupPointStep";
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
import TouristPickupPointStep from "@/app/(customer)/_components/transactions/forms/buy-fx/tourist/TouristPickupPointStep";
import type { TransactionAmountFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/vacation/PTATransactionAmountStep";
import PTATransactionAmountStep from "@/app/(customer)/_components/transactions/forms/buy-fx/vacation/PTATransactionAmountStep";
import type { UploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/vacation/PTAUploadDocumentsStep";
import PTAUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/buy-fx/vacation/PTAUploadDocumentsStep";
import PTAPickupPointStep from "@/app/(customer)/_components/transactions/forms/buy-fx/vacation/PTAPickupPointStep";
import type { BTAPickupPointFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/business/BTAPickupPointStep";
import type { TouristPickupPointFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/tourist/TouristPickupPointStep";
import type { PickupPointFormData } from "@/app/(customer)/_components/transactions/forms/buy-fx/vacation/PTAPickupPointStep";
import BankAccountSelectionStep from "@/app/(customer)/_components/transactions/forms/BankAccountSelectionStep";
import {
  payoutMethodRequiresDomiciliaryAccount,
} from "@/app/(customer)/_lib/payout-method-utils";
import { AddBankAccountModal } from "@/app/(customer)/_components/modals/AddBankAccountModal";
import type { AddBankAccountFormData } from "@/app/(customer)/_components/modals/AddBankAccountModal";
import type { BankAccount } from "@/app/(customer)/_components/transactions/forms/PickupPointStep";
import { useAgentBankAccounts } from "@/app/agent/_hooks/use-agent-bank-accounts";
import {
  getCreatedTransactionId,
  getRefundBankAccountId,
  mergeRefundBankIntoPickupData,
  toCreateBankAccountPayload,
} from "@/app/(customer)/_utils/customer-bank-accounts";
import { useUploadDocuments } from "@/app/(customer)/_hooks/use-document-upload";
import { mapUITypeToAPIType } from "@/app/(customer)/_utils/transaction-document-requirements";
import {
  getDocumentUploadSpec,
} from "@/app/(customer)/_utils/transaction-document-upload-spec";
import {
  getStepsForTransactionType,
  STEP_LABELS,
  getRefundBankStep,
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
import { useCallback, useMemo, useState } from "react";
import { CustomerInterface } from "../constant";
import { notifications } from "@mantine/notifications";
import { useAgentTransactionStep } from "@/app/agent/_hooks/use-agent-transaction-step";

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
  const usesPayoutMethod = !isSchoolFees && !isMedical && !isProfessionalBody;

  const [activeStep, setActiveStep] = useAgentTransactionStep(`/agent/transactions/${type}`);
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
    invalidate: invalidateBankAccounts,
  } = useAgentBankAccounts();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerInterface | null>(null);

  const steps = useMemo(() => {
    const base = getStepsForTransactionType(flowType).map((value) => ({
      label: STEP_LABELS[value],
      value,
    }));
    return [
      { label: "Select Customer", value: "select-customer" as AgentTransactionStep },
      ...base,
    ];
  }, [flowType]);

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
      setActiveStep("pickup-point");
    }
  };

  const handleBankDetailsSubmit = (
    data:
      | SchoolFeesBankDetailsFormData
      | MedicalBankDetailsFormData
      | ProfessionalBodyBankDetailsFormData
  ) => {
    setBankDetailsData(data);
    setActiveStep("refund-bank-details");
  };

  const handlePickupPointSubmit = (
    data: PickupPointFormData | BTAPickupPointFormData | TouristPickupPointFormData
  ) => {
    setPickupPointData(data);
    setActiveStep("bank-details");
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
    [addAccount]
  );

  const handleRefundBankSubmit = (bankAccount: BankAccount) => {
    setPickupPointData((prev) =>
      mergeRefundBankIntoPickupData(
        prev as Record<string, unknown> | null,
        bankAccount
      ) as PickupPointFormData | BTAPickupPointFormData | TouristPickupPointFormData
    );
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
      pickupPointData: pickupPointData ? (pickupPointData as Record<string, unknown>) : null,
      bankDetailsData: bankDetailsData ? (bankDetailsData as Record<string, unknown>) : null,
    };

    if (usesPayoutMethod && !pickupPointData) {
      setConfirmationOpened(false);
      notifications.show({
        title: "Pickup location required",
        message: "Go back and select a payout method before initiating the transaction.",
        color: "orange",
      });
      setActiveStep("pickup-point");
      return;
    }
    if (
      payoutMethodRequiresDomiciliaryAccount(pickupPointData?.payoutMethod) &&
      !pickupPointData?.domAccountDetails
    ) {
      setConfirmationOpened(false);
      notifications.show({
        title: "Domiciliary account required",
        message: "Complete domiciliary account details before initiating the transaction.",
        color: "orange",
      });
      setActiveStep("pickup-point");
      return;
    }
    if (!getRefundBankAccountId(pickupPointData as Record<string, unknown> | null)) {
      setConfirmationOpened(false);
      notifications.show({
        title: "Refund bank account required",
        message: "Select a local bank account for refunds before initiating the transaction.",
        color: "orange",
      });
      setActiveStep(getRefundBankStep(flowType));
      return;
    }
    if ((isSchoolFees || isMedical || isProfessionalBody) && !bankDetailsData) {
      setConfirmationOpened(false);
      notifications.show({
        title: "Bank details required",
        message: "Go back and complete bank details before continuing.",
        color: "orange",
      });
      setActiveStep("bank-details");
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
      const payload = buildTransactionPayload(transactionType, bag, documents, "BUY");
      const created = await createTransaction.mutateAsync({
        ...payload,
        userId: customerId,
      });
      const transactionId = getCreatedTransactionId(created);
      const bankAccountId = getRefundBankAccountId(
        pickupPointData as Record<string, unknown> | null
      );
      if (transactionId && bankAccountId) {
        try {
          await attachToTransaction(transactionId, [bankAccountId]);
        } catch (attachError) {
          handleApiError(attachError);
          notifications.show({
            title: "Transaction created",
            message:
              "The request was submitted, but linking the bank account failed. You can retry from transaction details.",
            color: "orange",
          });
        }
      }
      if (bankDetailsData) {
        await invalidateBankAccounts();
      }
      setConfirmationOpened(false);
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
    } else if (activeStep === "refund-bank-details") {
      setActiveStep(
        isSchoolFees || isMedical || isProfessionalBody ? "bank-details" : "pickup-point"
      );
    } else if (activeStep === "bank-details" && usesPayoutMethod) {
      setActiveStep("pickup-point");
    } else if (activeStep === "pickup-point" || activeStep === "bank-details") {
      setActiveStep("amount");
    } else if (activeStep !== "select-customer") {
      setActiveStep("select-customer");
    }
  };

  const renderRefundBankStep = () => (
    <BankAccountSelectionStep
      purpose="refund"
      banks={bankAccounts}
      isLoading={bankAccountsLoading}
      initialSelectedBankId={pickupPointData?.selectedRefundBankId}
      onSubmit={handleRefundBankSubmit}
      onBack={handleBack}
      onAddBank={() => setAddBankOpened(true)}
    />
  );

  const renderStepContent = () => {
    if (activeStep === "select-customer") {
      return (
        <AgentCustomerSelectStep
          onSubmit={(customer) => {
            setSelectedCustomer(customer);
            setActiveStep("upload-documents");
          }}
          onAddCustomer={() => setAddCustomerOpened(true)}
          selectedCustomer={selectedCustomer as any}
        />
      );
    }
    if (activeStep === "refund-bank-details") {
      return renderRefundBankStep();
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
        case "pickup-point":
          return (
            <TouristPickupPointStep
              initialValues={pickupPointData || undefined}
              onSubmit={handlePickupPointSubmit}
              onBack={handleBack}
            />
          );
        case "bank-details":
          return renderRefundBankStep();
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
                  : (selectedCustomerKycPrefill as Partial<ProfessionalBodyUploadDocumentsFormData>)
              }
              onSubmit={handleUploadDocumentsSubmit}
              onBack={handleBack}
              lockKycPrefill={lockSelectedCustomerKyc}
              omitLoggedInUserKyc
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
          return (
            <ProfessionalBodyBankDetailsStep
              initialValues={bankDetailsData || undefined}
              memberSummary={{
                memberName: selectedCustomer?.fullName || undefined,
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
              initialValues={
                uploadDocumentsData
                  ? (uploadDocumentsData as Partial<MedicalUploadDocumentsFormData>)
                  : (selectedCustomerKycPrefill as Partial<MedicalUploadDocumentsFormData>)
              }
              onSubmit={handleUploadDocumentsSubmit}
              onBack={handleBack}
              lockKycPrefill={lockSelectedCustomerKyc}
              omitLoggedInUserKyc
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
                  : (selectedCustomerKycPrefill as Partial<SchoolFeesUploadDocumentsFormData>)
              }
              onSubmit={handleUploadDocumentsSubmit}
              onBack={handleBack}
              lockKycPrefill={lockSelectedCustomerKyc}
              omitLoggedInUserKyc
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
              initialValues={
                uploadDocumentsData
                  ? (uploadDocumentsData as Partial<BTAUploadDocumentsFormData>)
                  : (selectedCustomerKycPrefill as Partial<BTAUploadDocumentsFormData>)
              }
              onSubmit={handleUploadDocumentsSubmit}
              onBack={handleBack}
              lockKycPrefill={lockSelectedCustomerKyc}
              omitLoggedInUserKyc
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
          return renderRefundBankStep();
        default:
          return null;
      }
    }

    switch (activeStep) {
      case "upload-documents":
        return (
          <PTAUploadDocumentsStep
            initialValues={
              uploadDocumentsData
                ? (uploadDocumentsData as Partial<UploadDocumentsFormData>)
                : (selectedCustomerKycPrefill as Partial<UploadDocumentsFormData>)
            }
            onSubmit={handleUploadDocumentsSubmit}
            onBack={handleBack}
            lockKycPrefill={lockSelectedCustomerKyc}
            omitLoggedInUserKyc
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
        return renderRefundBankStep();
      default:
        return null;
    }
  };

  const confirmTitle = isProfessionalBody
    ? "Initiate Professional Fees Transaction request?"
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

      <AgentAddCustomerModal
        opened={addCustomerOpened}
        onClose={() => setAddCustomerOpened(false)}
      />
    </>
  );
}
