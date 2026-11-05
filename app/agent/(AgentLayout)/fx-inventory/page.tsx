"use client";

import { useState } from "react";
import { Button, Group, Select, Tabs } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ListFilter, Plus } from "lucide-react";
import { CurrencySelectorWithSearch } from "@/app/(customer)/_components/dashboard/CurrencySelectorWithSearch";
import { CURRENCIES, getCurrencyByCode, type Currency } from "@/app/(customer)/_lib/currency";
import type { AgentDashboardCashStatsPeriod } from "@/app/_lib/api/types";
import {
  AGENT_DASHBOARD_PERIOD_OPTIONS,
  DEFAULT_AGENT_DASHBOARD_PERIOD,
} from "@/app/agent/_lib/dashboard-period";
import { SELECT_WIDTH } from "../../utils/constants";
import { useFxInventory } from "./hooks/useFxInventory";
import type { InventoryTabValue } from "./_lib/types";
import { SummaryCards } from "./_components/SummaryCards";
import { CashReceiptBanner } from "./_components/CashReceiptBanner";
import { InventoryPositionTab } from "./_components/InventoryPositionTab";
import { TransactionsTab } from "./_components/TransactionsTab";
import { PendingSettlementsTab } from "./_components/PendingSettlementsTab";
import { ReconciliationTab } from "./_components/ReconciliationTab";
import { HistoryTab } from "./_components/HistoryTab";
import { CashLodgementTab } from "./_components/CashLodgementTab";
import { LodgeCashModal } from "./_components/LodgeCashModal";
import { ReconcileAccountModal } from "./_components/ReconcileAccountModal";
import { ConfirmCashReceiptModal, type ReceiptModalMode } from "./_components/ConfirmCashReceiptModal";

const TABS: ReadonlyArray<{ value: InventoryTabValue; label: string }> = [
  { value: "position", label: "Inventory Position" },
  { value: "transactions", label: "Transactions" },
  { value: "pending-settlements", label: "Pending Settlements" },
  { value: "reconciliation", label: "Reconciliation" },
  { value: "history", label: "History" },
  { value: "cash-lodgement", label: "Cash Lodgement" },
];

export default function FXInventoryPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    getCurrencyByCode("USD") ?? CURRENCIES[0],
  );
  const [period, setPeriod] = useState<AgentDashboardCashStatsPeriod>(DEFAULT_AGENT_DASHBOARD_PERIOD);
  const [tab, setTab] = useState<InventoryTabValue>("position");

  const [lodgeOpen, setLodgeOpen] = useState(false);
  const [reconcileOpen, setReconcileOpen] = useState(false);
  const [receiptMode, setReceiptMode] = useState<ReceiptModalMode | null>(null);

  const inventory = useFxInventory(selectedCurrency.code);
  const { notice } = inventory;

  const lodgeableCurrencies = inventory.positionRows.map((r) => r.currency);

  return (
    <div className="space-y-6">
      <Group justify="flex-end" gap="md">
        <CurrencySelectorWithSearch selectedCurrency={selectedCurrency} onCurrencyChange={setSelectedCurrency} />
        <Select
          size="sm"
          w={SELECT_WIDTH}
          className="custom-select min-w-0"
          data={AGENT_DASHBOARD_PERIOD_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          value={period}
          onChange={(v) => {
            if (v) setPeriod(v as AgentDashboardCashStatsPeriod);
          }}
          rightSection={<ListFilter className="size-4" />}
          rightSectionPointerEvents="none"
          radius="2xl"
        />
      </Group>

      {notice && (
        <CashReceiptBanner
          notice={notice}
          onReject={() => setReceiptMode("reject")}
          onConfirm={() => setReceiptMode("review")}
        />
      )}

      <SummaryCards summary={inventory.summary} currency={selectedCurrency.code} />

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
          {tab === "position" && (
            <Button
              radius="xl"
              mb="xs"
              leftSection={<Plus size={16} />}
              onClick={() => setLodgeOpen(true)}
              className="bg-primary-400! hover:bg-primary-500!"
            >
              Lodge Cash
            </Button>
          )}
        </div>

        <div className="pt-4">
          <Tabs.Panel value="position">
            <InventoryPositionTab
              rows={inventory.positionRows}
              totals={inventory.positionTotals}
              pendingLodgements={inventory.lodgementStats.pendingVerification}
            />
          </Tabs.Panel>
          <Tabs.Panel value="transactions">
            <TransactionsTab
              rows={inventory.transactions}
              stats={inventory.transactionStats}
              currency={selectedCurrency.code}
              onNavigateTab={setTab}
            />
          </Tabs.Panel>
          <Tabs.Panel value="pending-settlements">
            <PendingSettlementsTab
              rows={inventory.settlements}
              stats={inventory.settlementStats}
              onMarkSettled={inventory.markSettled}
            />
          </Tabs.Panel>
          <Tabs.Panel value="reconciliation">
            <ReconciliationTab rows={inventory.reconciliation} onStart={() => setReconcileOpen(true)} />
          </Tabs.Panel>
          <Tabs.Panel value="history">
            <HistoryTab rows={inventory.history} />
          </Tabs.Panel>
          <Tabs.Panel value="cash-lodgement">
            <CashLodgementTab
              rows={inventory.lodgements}
              stats={inventory.lodgementStats}
              onLodge={() => setLodgeOpen(true)}
            />
          </Tabs.Panel>
        </div>
      </Tabs>

      <LodgeCashModal
        opened={lodgeOpen}
        onClose={() => setLodgeOpen(false)}
        currencies={lodgeableCurrencies}
        defaultCurrency={selectedCurrency.code}
        onSubmit={(currency, amount) => {
          inventory.lodgeCash(currency, amount);
          setLodgeOpen(false);
          notifications.show({
            title: "Cash lodged",
            message: "Your lodgment is awaiting HQ verification.",
            color: "green",
          });
        }}
      />

      <ReconcileAccountModal
        opened={reconcileOpen}
        onClose={() => setReconcileOpen(false)}
        rows={inventory.reconciliation}
        onSubmit={(currency, physicalCount) => {
          inventory.reconcile(currency, physicalCount);
          setReconcileOpen(false);
          notifications.show({
            title: "Reconciliation saved",
            message: `${currency} physical count recorded.`,
            color: "green",
          });
        }}
      />

      {notice && (
        <ConfirmCashReceiptModal
          opened={receiptMode !== null}
          mode={receiptMode ?? "review"}
          onModeChange={setReceiptMode}
          onClose={() => setReceiptMode(null)}
          notice={notice}
          onConfirm={() => {
            inventory.confirmReceipt();
            setReceiptMode(null);
            notifications.show({ title: "Receipt confirmed", message: `${notice.reference} confirmed.`, color: "green" });
          }}
          onReject={() => {
            inventory.rejectReceipt();
            setReceiptMode(null);
            notifications.show({ title: "Receipt rejected", message: `${notice.reference} rejected.`, color: "red" });
          }}
        />
      )}
    </div>
  );
}
