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
import { useCustomerBankAccounts } from "@/app/(customer)/_hooks/use-customer-bank-accounts";
import {
  getCreatedTransactionId,
  getPickupBankAccountId,
  getRefundBankAccountId,
  mergeRefundBankIntoPickupData,
  toCreateBankAccountPayload,
} from "@/app/(customer)/_utils/customer-bank-accounts";
import BankAccountSelectionStep from "@/app/(customer)/_components/transactions/forms/BankAccountSelectionStep";
import { AddBankAccountModal } from "@/app/(customer)/_components/modals/AddBankAccountModal";
import type { AddBankAccountFormData } from "@/app/(customer)/_components/modals/AddBankAccountModal";
import type { BankAccount } from "@/app/(customer)/_components/transactions/forms/PickupPointStep";
import { userProfileAtom } from "@/app/_lib/atoms/auth-atom";
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
  const [addBankOpened, setAddBankOpened] = useState(false);

  const userProfile = useAtomValue(userProfileAtom);
  const uploadDocuments = useUploadDocuments();
  const createTransaction = useCreateData(customerApi.transactions.create);
  const {
    accounts: bankAccounts,
    isLoading: bankAccountsLoading,
    addAccount,
    isSaving: isSavingBankAccount,
    attachToTransaction,
  } = useCustomerBankAccounts();

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
    setActiveStep("refund-bank-details");
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

  const handleRefundBankSubmit = (bankAccount: BankAccount) => {
    setPickupPointData((prev) =>
      mergeRefundBankIntoPickupData(
        prev as Record<string, unknown> | null,
        bankAccount
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
    if (!getRefundBankAccountId(pickupPointData as Record<string, unknown>)) {
      setConfirmationOpened(false);
      notifications.show({
        title: "Refund bank account required",
        message: "Select a local bank account for refunds before initiating your transaction.",
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
      console.log("documents", documents);
      console.log("bag", bag);
      console.log("transactionType", transactionType);
      const payload = buildTransactionPayload(transactionType, bag, documents, "SELL");
      // console.log("payload", payload);
 
      const created = await createTransaction.mutateAsync(payload);
      const transactionId = getCreatedTransactionId(created);
      const bankAccountId =
        getPickupBankAccountId(pickupPointData as Record<string, unknown>) ??
        getRefundBankAccountId(pickupPointData as Record<string, unknown>);
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
    } else if (activeStep === "refund-bank-details") {
      setActiveStep("pickup-point");
    } else if (activeStep === "pickup-point") {
      setActiveStep("amount");
    } else {
      router.push("/transactions/new/sell");
    }
  };

  const renderRefundBankStep = () => (
    <BankAccountSelectionStep
      purpose="refund"
      banks={bankAccounts}
      isLoading={bankAccountsLoading}
      initialSelectedBankId={
        (pickupPointData as { selectedRefundBankId?: string } | null)?.selectedRefundBankId
      }
      onSubmit={handleRefundBankSubmit}
      onBack={handleBack}
      onAddBank={() => setAddBankOpened(true)}
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
