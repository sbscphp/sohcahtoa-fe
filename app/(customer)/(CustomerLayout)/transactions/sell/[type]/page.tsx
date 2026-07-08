"use client";

import { useRouter, useParams } from "next/navigation";
import { useMemo, useState, useCallback } from "react";
import { useAtomValue } from "jotai";
import { useUploadDocuments } from "@/app/(customer)/_hooks/use-document-upload";
import { useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import CustomStepper from "@/app/(customer)/_components/common/CustomStepper";
import {
  type TransactionStep,
  getStepsForTransactionType,
  STEP_LABELS,
} from "@/app/(customer)/_utils/transaction-flow";
import {
  getDocumentUploadSpec,
  getSellOver10kDocumentUploadSpec,
  mergeDocumentUploadSpecs,
} from "@/app/(customer)/_utils/transaction-document-upload-spec";
import {
  buildTransactionPayload,
  toTransactionDocuments,
  type TransactionFormDataBag,
} from "@/app/(customer)/_utils/transaction-payload";
import { mapUITypeToAPIType } from "@/app/(customer)/_utils/transaction-document-requirements";
import { handleApiError } from "@/app/_lib/api/error-handler";
import { notifications } from "@mantine/notifications";
import {
  useCustomerBankAccounts,
  useDomiciliaryBankAccounts,
} from "@/app/(customer)/_hooks/use-customer-bank-accounts";
import {
  getCreatedTransactionId,
  getPickupBankAccountId,
  getRefundDomiciliaryBankAccountId,
  hasCompleteRefundDomiciliaryDetails,
  mergeRefundDomiciliaryIntoPickupData,
} from "@/app/(customer)/_utils/customer-bank-accounts";
import DomiciliaryRefundBankStep, {
  type DomiciliaryRefundAccount,
} from "@/app/(customer)/_components/transactions/forms/sell-fx/DomiciliaryRefundBankStep";
import { AddDomiciliaryAccountModal } from "@/app/(customer)/_components/modals/AddDomiciliaryAccountModal";
import type { DomiciliaryAccountFormData } from "@/app/(customer)/_lib/domiciliary-account-schema";
import { userProfileAtom } from "@/app/_lib/atoms/auth-atom";
import ResidentUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/sell-fx/resident/ResidentUploadDocumentsStep";
import ResidentTransactionAmountStep from "@/app/(customer)/_components/transactions/forms/sell-fx/resident/ResidentTransactionAmountStep";
import ResidentPickupPointStep from "@/app/(customer)/_components/transactions/forms/sell-fx/resident/ResidentPickupPointStep";
import TouringNigeriaUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/sell-fx/touring-nigeria/TouringNigeriaUploadDocumentsStep";
import TouringNigeriaPickupPointStep from "@/app/(customer)/_components/transactions/forms/sell-fx/touring-nigeria/TouringNigeriaPickupPointStep";
import ExpatriateUploadDocumentsStep from "@/app/(customer)/_components/transactions/forms/sell-fx/expatriate/ExpatriateUploadDocumentsStep";
import ExpatriatePickupPointStep from "@/app/(customer)/_components/transactions/forms/sell-fx/expatriate/ExpatriatePickupPointStep";
import { ConfirmationModal } from "@/app/(customer)/_components/modals/ConfirmationModal";
import { getSellFxInitiateNotices } from "@/app/(customer)/_lib/transaction-initiate-notices";
import type { ResidentUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/resident/ResidentUploadDocumentsStep";
import type { ResidentTransactionAmountFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/resident/ResidentTransactionAmountStep";
import type { ResidentPickupPointFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/resident/ResidentPickupPointStep";
import type { TouringNigeriaUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/touring-nigeria/TouringNigeriaUploadDocumentsStep";
import type { TouringNigeriaPickupPointFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/touring-nigeria/TouringNigeriaPickupPointStep";
import type { ExpatriateUploadDocumentsFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/expatriate/ExpatriateUploadDocumentsStep";
import type { ExpatriatePickupPointFormData } from "@/app/(customer)/_components/transactions/forms/sell-fx/expatriate/ExpatriatePickupPointStep";

const SELL_TYPE_MAP = {
  resident: "resident",
  "touring-nigeria": "touring-nigeria",
  expatriate: "expatriate",
} as const;

/** Step label overrides per flow */
const STEP_LABEL_OVERRIDES: Partial<
  Record<typeof SELL_TYPE_MAP[keyof typeof SELL_TYPE_MAP], Record<string, string>>
> = {};

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
    | TouringNigeriaPickupPointFormData
    | ExpatriatePickupPointFormData
    | null
  >(null);
  const [addBankOpened, setAddBankOpened] = useState(false);

  const domiciliaryAccountsEnabled =
    activeStep === "refund-bank-details" || addBankOpened;

  const userProfile = useAtomValue(userProfileAtom);
  const uploadDocuments = useUploadDocuments();
  const createTransaction = useCreateData(customerApi.transactions.create);
  const { attachToTransaction } = useCustomerBankAccounts({ enabled: false });
  const {
    selectableDomiciliaryAccounts,
    isLoading: domiciliaryAccountsLoading,
    addDomiciliaryAccount,
    isSaving: isSavingDomiciliaryAccount,
  } = useDomiciliaryBankAccounts(domiciliaryAccountsEnabled);

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
      | TouringNigeriaPickupPointFormData
      | ExpatriatePickupPointFormData
  ) => {
    setPickupPointData(data);
    setActiveStep("refund-bank-details");
  };

  const handleAddDomiciliaryAccount = useCallback(
    async (data: DomiciliaryAccountFormData) => {
      try {
        await addDomiciliaryAccount(data);
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    },
    [addDomiciliaryAccount],
  );

  const handleRefundBankSubmit = (account: DomiciliaryRefundAccount) => {
    setPickupPointData((prev) =>
      mergeRefundDomiciliaryIntoPickupData(
        prev as Record<string, unknown> | null,
        account,
      ) as ResidentPickupPointFormData
    );
    setConfirmationOpened(true);
  };

  const handleConfirmInitiate = async () => {
    if (uploadDocuments.isPending || createTransaction.isPending) return;

    const transactionType = mapUITypeToAPIType(flowType);
    if (!transactionType || !userProfile?.id || !uploadDocumentsData || !transactionAmountData) {
      setConfirmationOpened(false);
      notifications.show({
        title: "Incomplete transaction",
        message: "Complete each step before confirming.",
        color: "orange",
      });
      router.push("/transactions");
      return;
    }

    if (!pickupPointData) {
      setConfirmationOpened(false);
      notifications.show({
        title: "Select a pickup location",
        message: "Choose a pickup location or bank transfer option on the previous step before confirming.",
        color: "orange",
      });
      setActiveStep("pickup-point");
      return;
    }
    if (!hasCompleteRefundDomiciliaryDetails(pickupPointData as Record<string, unknown>)) {
      setConfirmationOpened(false);
      notifications.show({
        title: "Refund bank account required",
        message: "Select a domiciliary bank account for refunds before initiating your transaction.",
        color: "orange",
      });
      setActiveStep("refund-bank-details");
      return;
    }

    const bag: TransactionFormDataBag = {
      uploadDocumentsData: uploadDocumentsData as Record<string, unknown>,
      transactionAmountData: transactionAmountData as Record<string, unknown>,
      pickupPointData: pickupPointData ? (pickupPointData as Record<string, unknown>) : null,
    };

    try {
      const combinedSpec = mergeDocumentUploadSpecs(
        getDocumentUploadSpec(transactionType, bag.uploadDocumentsData),
        getSellOver10kDocumentUploadSpec(transactionType, bag.transactionAmountData)
      );

      const uploaded = combinedSpec
        ? await uploadDocuments.mutateAsync({
            file: combinedSpec.files,
            userId: userProfile.id,
            documentType: combinedSpec.documentTypes,
          })
        : [];
      const documents = toTransactionDocuments(uploaded);
      const payload = buildTransactionPayload(transactionType, bag, documents, "SELL");

      const created = await createTransaction.mutateAsync(payload);
      const transactionId = getCreatedTransactionId(created);
      const bankAccountIds = [
        getPickupBankAccountId(pickupPointData as Record<string, unknown>),
        getRefundDomiciliaryBankAccountId(pickupPointData as Record<string, unknown>),
      ].filter((id): id is string => Boolean(id));
      if (transactionId && bankAccountIds.length) {
        try {
          await attachToTransaction(transactionId, bankAccountIds);
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
    } else if (activeStep === "refund-bank-details") {
      setActiveStep("pickup-point");
    } else if (activeStep === "pickup-point") {
      setActiveStep("amount");
    } else {
      router.push("/transactions/new/sell");
    }
  };

  const renderRefundBankStep = () => (
    <DomiciliaryRefundBankStep
      accounts={selectableDomiciliaryAccounts}
      isLoading={domiciliaryAccountsLoading}
      initialSelectedAccountId={
        (pickupPointData as { selectedRefundDomiciliaryId?: string } | null)
          ?.selectedRefundDomiciliaryId
      }
      onSubmit={handleRefundBankSubmit}
      onBack={handleBack}
      onAddAccount={() => setAddBankOpened(true)}
    />
  );

  const renderStepContent = () => {
    if (activeStep === "refund-bank-details") {
      return renderRefundBankStep();
    }

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
            <TouringNigeriaPickupPointStep
              initialValues={
                pickupPointData
                  ? (pickupPointData as TouringNigeriaPickupPointFormData)
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
        notices={getSellFxInitiateNotices(flowType, {
          amount: transactionAmountData,
        })}
        requireInfoConfirmation
        confirmLabel="View Transaction"
        cancelLabel="No, Close"
        onConfirm={handleConfirmInitiate}
        loading={uploadDocuments.isPending || createTransaction.isPending}
      />

      <AddDomiciliaryAccountModal
        opened={addBankOpened}
        onClose={() => setAddBankOpened(false)}
        onAddAccount={handleAddDomiciliaryAccount}
        isSubmitting={isSavingDomiciliaryAccount}
      />
    </div>
  );
}
