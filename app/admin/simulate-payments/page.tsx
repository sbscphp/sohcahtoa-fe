"use client";

import { useState } from "react";
import { NumberInput, Text, TextInput } from "@mantine/core";

import { CustomButton } from "@/app/admin/_components/CustomButton";
import {
  useSimulateExactPayment,
  useSimulateOverpayment,
  useSimulateSplitPayment,
  useVerifySimulatedPayment,
} from "@/app/admin/_services/simulate-payments-api";

const DEFAULT_SOURCE = {
  sourceAccountName: "DevOps Test Payer",
  sourceBankName: "Test Bank",
  sourceAccountNumber: "0123456789",
};

export default function SimulatePaymentsPage() {
  const [transactionId, setTransactionId] = useState("");
  const [sourceAccountName, setSourceAccountName] = useState(
    DEFAULT_SOURCE.sourceAccountName
  );
  const [sourceBankName, setSourceBankName] = useState(
    DEFAULT_SOURCE.sourceBankName
  );
  const [sourceAccountNumber, setSourceAccountNumber] = useState(
    DEFAULT_SOURCE.sourceAccountNumber
  );
  const [overageAmount, setOverageAmount] = useState<number | string>(1000);
  const [splitAmount, setSplitAmount] = useState<number | string>(5000);
  const [lastResponse, setLastResponse] = useState<unknown>(null);

  const exactMutation = useSimulateExactPayment();
  const overpaymentMutation = useSimulateOverpayment();
  const splitMutation = useSimulateSplitPayment();
  const verifyMutation = useVerifySimulatedPayment();

  const isBusy =
    exactMutation.isPending ||
    overpaymentMutation.isPending ||
    splitMutation.isPending ||
    verifyMutation.isPending;

  const sourceFields = {
    transactionId: transactionId.trim(),
    sourceAccountName: sourceAccountName.trim(),
    sourceBankName: sourceBankName.trim(),
    sourceAccountNumber: sourceAccountNumber.trim(),
  };

  const canSubmit = Boolean(sourceFields.transactionId);

  const captureResult = (result: unknown) => {
    setLastResponse(result);
  };

  const handleExact = () => {
    if (!canSubmit) return;
    exactMutation.mutate(sourceFields, {
      onSuccess: captureResult,
      onError: (error) => captureResult(error),
    });
  };

  const handleOverpayment = () => {
    if (!canSubmit) return;
    overpaymentMutation.mutate(
      {
        ...sourceFields,
        overageAmount: Number(overageAmount) || 0,
      },
      {
        onSuccess: captureResult,
        onError: (error) => captureResult(error),
      }
    );
  };

  const handleSplit = () => {
    if (!canSubmit) return;
    splitMutation.mutate(
      {
        ...sourceFields,
        splitAmount: Number(splitAmount) || 0,
      },
      {
        onSuccess: captureResult,
        onError: (error) => captureResult(error),
      }
    );
  };

  const handleVerify = () => {
    if (!canSubmit) return;
    verifyMutation.mutate(sourceFields.transactionId, {
      onSuccess: captureResult,
      onError: (error) => captureResult(error),
    });
  };

  return (
    <div className="min-h-screen bg-[var(--color-gray-100)] px-4 py-10">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="space-y-1">
          <p className="text-sm font-medium text-[var(--color-primary-400)]">
            DevOps tool
          </p>
          <h1 className="text-2xl font-semibold text-[var(--color-gray-900)]">
            Simulate payments
          </h1>
          <Text size="sm" c="dimmed">
            Quick tester for exact, overpayment, and split deposit simulations.
            Simulation mode must be enabled on the API.
          </Text>
        </header>

        <section className="space-y-4 rounded-2xl border border-[var(--color-gray-200)] bg-white p-5">
          <TextInput
            label="Transaction ID"
            placeholder="Paste transaction UUID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.currentTarget.value)}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Source account name"
              value={sourceAccountName}
              onChange={(e) => setSourceAccountName(e.currentTarget.value)}
            />
            <TextInput
              label="Source bank name"
              value={sourceBankName}
              onChange={(e) => setSourceBankName(e.currentTarget.value)}
            />
            <TextInput
              label="Source account number"
              value={sourceAccountNumber}
              onChange={(e) => setSourceAccountNumber(e.currentTarget.value)}
            />
            <NumberInput
              label="Overage amount (overpayment)"
              value={overageAmount}
              onChange={setOverageAmount}
              min={0}
              thousandSeparator
            />
            <NumberInput
              label="Split amount (partial)"
              value={splitAmount}
              onChange={setSplitAmount}
              min={0}
              thousandSeparator
              description="Must be less than expected naira amount"
            />
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-[var(--color-gray-200)] bg-white p-5">
          <Text fw={600} size="sm" className="text-[var(--color-gray-800)]">
            Actions
          </Text>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <CustomButton
              buttonType="primary"
              onClick={handleExact}
              loading={exactMutation.isPending}
              disabled={!canSubmit || isBusy}
              className="flex-1"
            >
              Exact payment
            </CustomButton>
            <CustomButton
              buttonType="secondary"
              color="orange"
              onClick={handleOverpayment}
              loading={overpaymentMutation.isPending}
              disabled={!canSubmit || isBusy}
              className="flex-1"
            >
              Overpayment
            </CustomButton>
            <CustomButton
              buttonType="secondary"
              color="orange"
              onClick={handleSplit}
              loading={splitMutation.isPending}
              disabled={!canSubmit || isBusy}
              className="flex-1"
            >
              Split / partial
            </CustomButton>
            <CustomButton
              buttonType="tertiary"
              onClick={handleVerify}
              loading={verifyMutation.isPending}
              disabled={!canSubmit || isBusy}
              className="flex-1"
            >
              Verify status
            </CustomButton>
          </div>
          <Text size="xs" c="dimmed">
            Exact → DEPOSIT_CONFIRMED. Overpayment / split → DEPOSIT_PENDING for
            admin review.
          </Text>
        </section>

        <section className="space-y-2 rounded-2xl border border-[var(--color-gray-200)] bg-white p-5">
          <Text fw={600} size="sm" className="text-[var(--color-gray-800)]">
            Last response
          </Text>
          <pre className="max-h-96 overflow-auto rounded-xl bg-[var(--color-gray-900)] p-4 text-xs text-[var(--color-gray-25)]">
            {lastResponse
              ? JSON.stringify(lastResponse, null, 2)
              : "No request sent yet."}
          </pre>
        </section>
      </div>
    </div>
  );
}
