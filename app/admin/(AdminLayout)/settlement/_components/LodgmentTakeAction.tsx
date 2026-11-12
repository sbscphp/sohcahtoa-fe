"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Menu, Modal, NumberInput, Select, TextInput } from "@mantine/core";
import { X } from "lucide-react";
import { ConfirmationModal } from "@/app/admin/_components/ConfirmationModal";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { getCurrencySymbol } from "@/app/admin/_lib/currency";
import { adminRoutes } from "@/lib/adminRoutes";

type ActionFlow = "confirm" | "reject" | "save" | null;

interface LodgmentTakeActionProps {
  agentName: string;
  currency: string;
  returnedAmount: number;
  updatedAmount: number | null;
  canAct?: boolean;
  onSaveAmount: (amount: number) => Promise<void>;
  onConfirm: () => Promise<void>;
  onReject: () => Promise<void>;
}

export default function LodgmentTakeAction({
  agentName,
  currency,
  returnedAmount,
  updatedAmount,
  canAct = true,
  onSaveAmount,
  onConfirm,
  onReject,
}: LodgmentTakeActionProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [draftAmount, setDraftAmount] = useState<number | "">(updatedAmount ?? 0);
  const [amountError, setAmountError] = useState("");
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  const [flow, setFlow] = useState<ActionFlow>(null);
  const [successFlow, setSuccessFlow] = useState<ActionFlow>(null);
  const [submitting, setSubmitting] = useState(false);

  const currencyOptions = [{ value: currency, label: currency }];
  const amountPrefix = `${getCurrencySymbol(currency)} `;

  const openEdit = () => {
    setDraftAmount(updatedAmount ?? 0);
    setAmountError("");
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setAmountError("");
  };

  const requestSave = () => {
    if (draftAmount === "" || !Number.isFinite(draftAmount) || draftAmount < 0) {
      setAmountError("Updated amount is required");
      return;
    }
    setPendingAmount(draftAmount);
    setEditOpen(false);
    setFlow("save");
  };

  const closeFlow = () => {
    setFlow(null);
    setPendingAmount(null);
  };

  const runAction = async (action: () => Promise<void>, success: Exclude<ActionFlow, null>) => {
    setSubmitting(true);
    try {
      await action();
      setFlow(null);
      setPendingAmount(null);
      setSuccessFlow(success);
    } catch {
      // The caller shows the error and keeps the confirmation open.
    } finally {
      setSubmitting(false);
    }
  };

  const applySave = () => {
    if (pendingAmount === null) return;
    const amount = pendingAmount;
    void runAction(() => onSaveAmount(amount), "save");
  };

  const finishSuccess = () => {
    setSuccessFlow(null);
  };

  return (
    <>
      {canAct ? (
        <Menu position="bottom-end" shadow="md" radius="md" width={180}>
          <Menu.Target>
            <Button color="orange" radius="xl">
              Take Action
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={openEdit}>Edit</Menu.Item>
            <Menu.Divider />
            <Menu.Item onClick={() => setFlow("confirm")}>Confirm</Menu.Item>
            <Menu.Divider />
            <Menu.Item onClick={() => setFlow("reject")}>Reject</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ) : null}

      <Modal
        opened={editOpen}
        onClose={closeEdit}
        withCloseButton={false}
        centered
        radius="lg"
        padding="lg"
        size="lg"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Cash Lodgment</h2>
            <p className="mt-1 text-sm text-gray-500">Make changes to this cash lodgment amount</p>
          </div>
          <button
            type="button"
            aria-label="Close edit lodgment"
            onClick={closeEdit}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-500"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5 py-5">
          <TextInput label="Agent Name" withAsterisk value={agentName} disabled radius="md" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-medium text-gray-900">
                Amount <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-2">
                <NumberInput
                  className="flex-1"
                  prefix={amountPrefix}
                  thousandSeparator=","
                  decimalScale={2}
                  hideControls
                  value={returnedAmount}
                  disabled
                  radius="md"
                />
                <Select data={currencyOptions} value={currency} disabled w={90} radius="md" />
              </div>
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-gray-900">
                Updated Amount <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-2">
                <NumberInput
                  className="flex-1"
                  prefix={amountPrefix}
                  thousandSeparator=","
                  decimalScale={2}
                  hideControls
                  value={draftAmount}
                  onChange={(value) => {
                    setDraftAmount(value === "" ? "" : Number(value));
                    if (amountError) setAmountError("");
                  }}
                  error={amountError}
                  radius="md"
                  aria-label="Updated amount"
                />
                <Select
                  data={currencyOptions}
                  value={currency}
                  disabled
                  w={90}
                  radius="md"
                  aria-label="Updated amount currency"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <CustomButton buttonType="secondary" onClick={closeEdit}>
            Close
          </CustomButton>
          <CustomButton buttonType="primary" onClick={requestSave}>
            Save Changes
          </CustomButton>
        </div>
      </Modal>

      <ConfirmationModal
        opened={flow === "confirm"}
        onClose={closeFlow}
        title="Confirm Amount?"
        message="You are about to mark this Cash Lodgment as confirmed. Once confirmed, the cash lodgment will be received."
        primaryButtonText="Yes, Confirm Amount"
        secondaryButtonText="No, Close"
        loading={submitting && flow === "confirm"}
        onPrimary={() => {
          void runAction(onConfirm, "confirm");
        }}
        onSecondary={closeFlow}
      />

      <ConfirmationModal
        opened={flow === "reject"}
        onClose={closeFlow}
        title="Reject Lodgment?"
        message="You are about to reject this cash lodgment. Once rejected, the agent will be notified."
        primaryButtonText="Yes, Reject"
        secondaryButtonText="No, Close"
        loading={submitting && flow === "reject"}
        onPrimary={() => {
          void runAction(onReject, "reject");
        }}
        onSecondary={closeFlow}
      />

      <ConfirmationModal
        opened={flow === "save"}
        onClose={closeFlow}
        title="Save Changes ?"
        message="Are you sure, save and update this changes? Kindly note that this new changes would override the existing data."
        primaryButtonText="Yes, Save and Update Changes"
        secondaryButtonText="No, Close"
        loading={submitting && flow === "save"}
        onPrimary={applySave}
        onSecondary={closeFlow}
      />

      <SuccessModal
        opened={successFlow === "confirm"}
        onClose={finishSuccess}
        title="Amount Confirmed"
        message="The cash lodgment has been confirmed"
        primaryButtonText="Close"
        primaryButtonVariant="outline"
        onPrimaryClick={finishSuccess}
      />

      <SuccessModal
        opened={successFlow === "reject"}
        onClose={finishSuccess}
        title="Cash Lodgment Rejected"
        message="The cash lodgment has been rejected"
        primaryButtonText="Close"
        primaryButtonVariant="outline"
        onPrimaryClick={finishSuccess}
      />

      <SuccessModal
        opened={successFlow === "save"}
        onClose={() => setSuccessFlow(null)}
        title="New Changes Saved"
        message="New Changes has been successfully Saved and Updated"
        primaryButtonText="View FX Inventory"
        onPrimaryClick={() => router.push(adminRoutes.adminSettlementFxInventory())}
        secondaryButtonText="No, Close"
        onSecondaryClick={() => setSuccessFlow(null)}
      />
    </>
  );
}
