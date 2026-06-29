"use client";

import { useCallback, useMemo, useState } from "react";
import { Card, Text, TextInput } from "@mantine/core";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { TableWrapper, type FilterTabOption } from "@/app/agent/_components/common";
import type { AgentPaymentMovementExportParams, AgentPaymentMovementItem } from "@/app/_lib/api/types";
import { useCreateData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";
import { useCashInventoryMovements } from "../hooks/useCashInventoryMovements";
import {
  formatMovementDate,
  formatTransactionTypeLabel,
  movementAmountDisplay,
  movementReceivedFromLabel,
} from "../_lib/format-inventory";
import { buildCashInventoryColumns } from "./cash-inventory-columns";
import { TransactionDetailsModal } from "./TransactionDetailsModal";

const FILTER_TABS: FilterTabOption[] = [
  { value: "cash_disbursed", label: "Cash Disbursed" },
  { value: "cash_received_from_customer", label: "Cash Received from Customer" },
  { value: "cash_received_from_admin", label: "Cash Received from Admin" },
];

export function CashInventoryTable() {
  const router = useRouter();
  const {
    table,
    movementType,
    handleMovementTypeChange,
    rows,
    totalPages,
    isLoading,
    error,
    pageSize,
  } = useCashInventoryMovements();

  const [selectedRow, setSelectedRow] = useState<AgentPaymentMovementItem | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const openDetails = useCallback((item: AgentPaymentMovementItem) => {
    setSelectedRow(item);
    setModalOpened(true);
  }, []);

  const exportParams = useMemo<AgentPaymentMovementExportParams>(
    () => ({
      type: movementType,
      q: table.searchValue?.trim() || undefined,
    }),
    [movementType, table.searchValue],
  );

  const exportMutation = useCreateData(async () => {
    const { blob, filename } = await agentApi.transactions.paymentMovementsExport(
      exportParams,
    );
    return {
      blob,
      filename:
        filename ??
        `cash-inventory-${movementType}-${new Date().toISOString().slice(0, 10)}.csv`,
    };
  });

  const handleExport = useCallback(() => {
    if (exportMutation.isPending) return;
    exportMutation.mutate(undefined, {
      onSuccess: ({ blob, filename }) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
      },
      onError: (error) => {
        notifications.show({
          title: "Export failed",
          message:
            error.message || "Unable to export cash inventory. Please try again.",
          color: "red",
        });
      },
    });
  }, [exportMutation]);

  const goToTransaction = useCallback(
    (id: string) => {
      router.push(`/agent/transactions/detail/${id}`);
    },
    [router]
  );

  const columns = useMemo(
    () =>
      buildCashInventoryColumns({
        movementType,
        onOpenDetails: openDetails,
      }),
    [movementType, openDetails]
  );

  return (
    <>
      <Card radius="md" padding="lg" withBorder>
        {error ? (
          <Text size="sm" c="red" mb="md">
            {(error as Error)?.message ?? "Could not load cash movements."}
          </Text>
        ) : null}
        <TableWrapper<AgentPaymentMovementItem>
          title="Cash inventory"
          filterOptions={FILTER_TABS}
          activeFilter={movementType}
          onFilterChange={handleMovementTypeChange}
          onExportClick={handleExport}
          toolbarBelowFilters={
            <div className="flex flex-col gap-3 pt-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
              <TextInput
                placeholder="Enter keyword"
                value={table.searchValue}
                onChange={(e) => table.setSearch(e.currentTarget.value)}
                size="sm"
                className="w-full sm:max-w-xs"
              />
            </div>
          }
          data={rows}
          columns={columns}
          pageSize={pageSize}
          page={table.page ?? 1}
          onPageChange={(p) => table.setPage(p)}
          totalPages={totalPages}
          onRowClick={openDetails}
          keyExtractor={(t) => t.transaction_id}
          emptyTitle="No data available yet"
          emptyMessage="You currently have no cash movements for this filter. Check back later."
          isLoading={isLoading}
        />
      </Card>

      {selectedRow && (
        <TransactionDetailsModal
          opened={modalOpened}
          onClose={() => {
            setModalOpened(false);
            setSelectedRow(null);
          }}
          movementType={movementType}
          transactionId={selectedRow.transaction_id}
          customerOrAdminName={movementReceivedFromLabel(selectedRow, movementType)}
          amountLabel={
            movementType === "cash_disbursed" ? "Cash disbursed" : "Cash received"
          }
          amountFormatted={movementAmountDisplay(selectedRow, movementType)}
          currencyPair={selectedRow.currency_pair ?? undefined}
          transactionTypeLabel={formatTransactionTypeLabel(selectedRow.transaction_type ?? undefined)}
          transactionDate={formatMovementDate(selectedRow.transaction_date)}
          onViewFullTransaction={() => goToTransaction(selectedRow.transaction_id)}
        />
      )}
    </>
  );
}
