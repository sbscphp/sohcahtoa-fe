"use client";

import { useCallback, useMemo, useState } from "react";
import {
  MOCK_AVAILABLE_FX,
  MOCK_DISBURSEMENT_NOTICE,
  MOCK_HISTORY,
  MOCK_LODGEMENTS,
  MOCK_NGN_CASH_AVAILABLE,
  MOCK_PENDING_SETTLEMENTS,
  MOCK_POSITION_ROWS,
  MOCK_POSITION_TOTALS,
  MOCK_RECONCILIATION_ROWS,
  MOCK_TRANSACTIONS,
  MOCK_TRANSACTION_STATS,
} from "../_lib/mock-data";
import type {
  CashDisbursementNotice,
  CashLodgement,
  InventorySummary,
  PendingSettlement,
  ReconciliationRow,
} from "../_lib/types";

/**
 * Single source for the FX Inventory screen. Backed by local mock state until the
 * agent fx-inventory endpoints (balances, lodge, lodgments, disbursements) return final shapes —
 * swap the `useState` seeds for `useFetchData` / `useCreateData` calls here and the UI stays untouched.
 */
export function useFxInventory(currencyCode: string) {
  const [settlements, setSettlements] = useState<PendingSettlement[]>(MOCK_PENDING_SETTLEMENTS);
  const [reconciliation, setReconciliation] = useState<ReconciliationRow[]>(MOCK_RECONCILIATION_ROWS);
  const [lodgements, setLodgements] = useState<CashLodgement[]>(MOCK_LODGEMENTS);
  const [notice, setNotice] = useState<CashDisbursementNotice | null>(MOCK_DISBURSEMENT_NOTICE);

  const unsettled = useMemo(() => settlements.filter((s) => s.status !== "Settled"), [settlements]);

  const summary = useMemo<InventorySummary>(
    () => ({
      availableFxInventory: MOCK_AVAILABLE_FX[currencyCode] ?? 0,
      ngnCashAvailable: MOCK_NGN_CASH_AVAILABLE,
      pendingSettlements: unsettled.length,
      inventoryVariance: 0,
    }),
    [currencyCode, unsettled.length],
  );

  const settlementStats = useMemo(
    () => ({
      pending: unsettled.length,
      totalOutstanding: unsettled.reduce((sum, s) => sum + s.ngnAmountOwed, 0),
      overdue: settlements.filter((s) => s.status === "Overdue").length,
    }),
    [settlements, unsettled],
  );

  const lodgementStats = useMemo(
    () => ({
      pendingVerification: lodgements.filter((l) => l.status === "Pending Verification").length,
      confirmed: lodgements.filter((l) => l.status === "Confirmed").length,
      varianceRecorded: lodgements.filter((l) => (l.variance ?? 0) !== 0).length,
    }),
    [lodgements],
  );

  const markSettled = useCallback((id: string) => {
    setSettlements((prev) => prev.map((s) => (s.id === id ? { ...s, status: "Settled" } : s)));
  }, []);

  const reconcile = useCallback(
    (currency: string, physicalCount: number) => {
      setReconciliation((prev) =>
        prev.map((row) => {
          if (row.currency !== currency) return row;
          const variance = physicalCount - row.systemClosingBalance;
          return {
            ...row,
            physicalCount,
            variance,
            variancePercent: row.systemClosingBalance ? (variance / row.systemClosingBalance) * 100 : 0,
            status: variance === 0 ? "Reconciled" : "Needs Review",
            lastUpdated: new Date().toISOString(),
          };
        }),
      );
    },
    [],
  );

  const lodgeCash = useCallback((currency: string, amount: number) => {
    setLodgements((prev) => [
      {
        id: `l-${Date.now()}`,
        currency,
        declaredAmount: amount,
        amountReceived: null,
        variance: null,
        status: "Pending Verification",
        submittedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const clearNotice = useCallback(() => setNotice(null), []);

  return {
    summary,
    positionRows: MOCK_POSITION_ROWS,
    positionTotals: MOCK_POSITION_TOTALS,
    transactions: MOCK_TRANSACTIONS,
    transactionStats: MOCK_TRANSACTION_STATS,
    settlements,
    settlementStats,
    reconciliation,
    history: MOCK_HISTORY,
    lodgements,
    lodgementStats,
    notice,
    markSettled,
    reconcile,
    lodgeCash,
    confirmReceipt: clearNotice,
    rejectReceipt: clearNotice,
  };
}
