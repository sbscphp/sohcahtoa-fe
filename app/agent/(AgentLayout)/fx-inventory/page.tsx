"use client";

import { useState } from "react";
import { Group, Select, Tabs, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ListFilter } from "lucide-react";
import { SuccessModal } from "@/app/(customer)/_components/modals/SuccessModal";
import { CURRENCIES } from "@/app/(customer)/_lib/currency";
import type { AgentDashboardCashStatsPeriod } from "@/app/_lib/api/types";
import { useHydratedProfileDisplay } from "@/app/_lib/hooks/use-hydrated-profile-display";
import {
  AGENT_DASHBOARD_PERIOD_OPTIONS,
  DEFAULT_AGENT_DASHBOARD_PERIOD,
} from "@/app/agent/_lib/dashboard-period";
import { getAgentApiErrorMessage } from "@/app/agent/_utils/api-error-message";
import { SELECT_WIDTH } from "../../utils/constants";
import { useFxInventory } from "./hooks/useFxInventory";
import type { CashDisbursement, InventoryTabValue } from "./_lib/types";
import { SummaryCards } from "./_components/SummaryCards";
import { InventoryPositionTab } from "./_components/InventoryPositionTab";
import { TransactionsTab } from "./_components/TransactionsTab";
import { InventoryReceivedTab } from "./_components/InventoryReceivedTab";
import { CashLodgementTab } from "./_components/CashLodgementTab";
import { LodgeCashModal } from "./_components/LodgeCashModal";
import { ConfirmCashReceiptModal, RejectCashReceiptModal } from "./_components/ReceiptModals";

const TABS: ReadonlyArray<{ value: InventoryTabValue; label: string }> = [
  { value: "position", label: "Inventory Position" },
  { value: "transactions", label: "Transactions" },
  { value: "received", label: "Inventory Received" },
  { value: "cash-lodgement", label: "Cash Lodgement" },
];

const CURRENCY_CODES = CURRENCIES.map((c) => c.code);
const FX_CODES = CURRENCY_CODES.filter((c) => c !== "NGN");

type ReceiptAction = { mode: "confirm" | "reject"; item: CashDisbursement };

export default function FXInventoryPage() {
  const [currency, setCurrency] = useState<string>(FX_CODES[0] ?? "USD");
  const [period, setPeriod] = useState<AgentDashboardCashStatsPeriod>(DEFAULT_AGENT_DASHBOARD_PERIOD);
  const [tab, setTab] = useState<InventoryTabValue>("position");

  const [lodgeOpen, setLodgeOpen] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptAction | null>(null);
  const [feedback, setFeedback] = useState<"confirmed" | "rejected" | null>(null);

  const inventory = useFxInventory(period, currency);
  const { displayName } = useHydratedProfileDisplay({ fallbackName: "Agent" });

  const showError = (title: string, error: unknown) =>
    notifications.show({ title, message: getAgentApiErrorMessage(error, "Please try again."), color: "red" });

  return (
    <div className="space-y-6">
      <Group justify="flex-end" gap="md">
        <Select
          size="sm"
          w={SELECT_WIDTH + 40}
          className="custom-select min-w-0"
          data={AGENT_DASHBOARD_PERIOD_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          value={period}
          onChange={(v) => {
            if (v) setPeriod(v as AgentDashboardCashStatsPeriod);
          }}
          leftSection={<span className="pl-2 text-xs text-body-text-50">Date:</span>}
          leftSectionWidth={44}
          rightSection={<ListFilter className="size-4" />}
          rightSectionPointerEvents="none"
          radius="2xl"
        />
      </Group>

      {inventory.errorMessage && (
        <Text size="sm" c="red">
          {inventory.errorMessage}
        </Text>
      )}

      <SummaryCards
        summary={inventory.summary}
        currency={currency}
        currencies={FX_CODES}
        onCurrencyChange={setCurrency}
      />

      <Tabs
        variant="unstyled"
        value={tab}
        onChange={(v) => v && setTab(v as InventoryTabValue)}
        keepMounted={false}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100">
          <Tabs.List className="flex min-w-0 max-w-full flex-nowrap! gap-6 overflow-x-auto!">
            {TABS.map((t) => (
              <Tabs.Tab
                key={t.value}
                value={t.value}
                className="-mb-px shrink-0 cursor-pointer whitespace-nowrap border-b-2! border-transparent! px-0.5 pb-3 text-sm text-body-text-100! transition-colors hover:text-body-text-300! data-[active=true]:border-primary-400! data-[active=true]:text-primary-400!"
              >
                {t.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </div>

        <div className="pt-4">
          <Tabs.Panel value="position">
            <InventoryPositionTab
              rows={inventory.positionRows}
              pendingLodgements={inventory.pendingLodgements}
              isLoading={inventory.isLoading}
            />
          </Tabs.Panel>
          <Tabs.Panel value="transactions">
            <TransactionsTab
              rows={inventory.transactions}
              stats={inventory.transactionStats}
              currency={currency}
              isLoading={inventory.isLoading}
            />
          </Tabs.Panel>
          <Tabs.Panel value="received">
            <InventoryReceivedTab
              rows={inventory.disbursements}
              stats={inventory.disbursementStats}
              isLoading={inventory.isLoading}
              onConfirm={(item) => setReceipt({ mode: "confirm", item })}
              onReject={(item) => setReceipt({ mode: "reject", item })}
            />
          </Tabs.Panel>
          <Tabs.Panel value="cash-lodgement">
            <CashLodgementTab
              rows={inventory.lodgements}
              stats={inventory.lodgementStats}
              isLoading={inventory.isLoading}
              onLodge={() => setLodgeOpen(true)}
            />
          </Tabs.Panel>
        </div>
      </Tabs>

      <LodgeCashModal
        opened={lodgeOpen}
        onClose={() => setLodgeOpen(false)}
        currencies={CURRENCY_CODES}
        defaultCurrency={currency}
        isPending={inventory.lodgeCash.isPending}
        onSubmit={(code, amount, notes) =>
          inventory.lodgeCash.mutate(
            { currency: code, amount, ...(notes ? { notes } : {}) },
            {
              onSuccess: () => {
                setLodgeOpen(false);
                setTab("cash-lodgement");
                notifications.show({
                  title: "Lodgment submitted",
                  message: "It will show as Pending Verification until HQ confirms receipt.",
                  color: "green",
                });
              },
              onError: (e) => showError("Could not submit lodgment", e),
            },
          )
        }
      />

      {receipt && (
        <>
          <ConfirmCashReceiptModal
            opened={receipt.mode === "confirm"}
            onClose={() => setReceipt(null)}
            item={receipt.item}
            agentName={displayName}
            isPending={inventory.confirmReceipt.isPending}
            onConfirm={() =>
              inventory.confirmReceipt.mutate(receipt.item.id, {
                onSuccess: () => {
                  setReceipt(null);
                  setFeedback("confirmed");
                },
                onError: (e) => showError("Could not confirm receipt", e),
              })
            }
          />
          <RejectCashReceiptModal
            opened={receipt.mode === "reject"}
            onClose={() => setReceipt(null)}
            item={receipt.item}
            agentName={displayName}
            isPending={inventory.rejectReceipt.isPending}
            onSubmit={(reason) =>
              inventory.rejectReceipt.mutate(
                { id: receipt.item.id, reason },
                {
                  onSuccess: () => {
                    setReceipt(null);
                    setFeedback("rejected");
                  },
                  onError: (e) => showError("Could not reject receipt", e),
                },
              )
            }
          />
        </>
      )}

      <SuccessModal
        opened={feedback !== null}
        onClose={() => setFeedback(null)}
        title={feedback === "rejected" ? "Receipt Rejected" : "Receipt Confirmed"}
        message={
          feedback === "rejected"
            ? "You have successfully rejected receipt of this disbursement."
            : "You have successfully confirmed receipt of this disbursement."
        }
        buttonText="Continue"
        buttonVariant="outline"
        onButtonClick={() => setFeedback(null)}
      />
    </div>
  );
}
