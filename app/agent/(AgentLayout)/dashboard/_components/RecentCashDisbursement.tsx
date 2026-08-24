"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LucideIcon } from "lucide-react";
import { IconRecieve } from "@/components/icons";
import SectionHeader from "@/app/(customer)/_components/dashboard/SectionHeader";
import SeeAllButton from "@/app/(customer)/_components/dashboard/SeeAllButton";
import TransactionListItem from "@/app/(customer)/_components/dashboard/TransactionListItem";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import type { AgentPaymentMovementsResponse } from "@/app/_lib/api/types";
import { agentApi } from "@/app/agent/_services/agent-api";
import {
  formatMovementDate,
  movementAmountDisplay,
} from "@/app/agent/(AgentLayout)/fx-inventory/_lib/format-inventory";

const MOVEMENT_TYPE = "cash_disbursed" as const;
const PAGE = 1;
const LIMIT = 10;

export function RecentCashDisbursement() {
  const router = useRouter();

  const { data, isLoading } = useFetchData<AgentPaymentMovementsResponse>(
    agentKeys.transactions.paymentMovements({
      type: MOVEMENT_TYPE,
      page: PAGE,
      limit: LIMIT,
    }) as unknown as unknown[],
    () =>
      agentApi.transactions.paymentMovements({
        type: MOVEMENT_TYPE,
        page: PAGE,
        limit: LIMIT,
      }),
    true
  );

  const rows = useMemo(() => data?.data ?? [], [data]);

  return (
    <div className="flex flex-col rounded-2xl bg-[#FAFAFA] p-2 shadow-sm">
      <SectionHeader
        title="Recent cash disbursement"
        action={
          <SeeAllButton
            onClick={() => router.push("/agent/fx-inventory")}
            isViewAll
          />
        }
      />
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-5 animate-spin text-gray-500" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No cash disbursements yet
          </p>
        ) : (
          rows.map((row, index) => {
            const amount = movementAmountDisplay(row, MOVEMENT_TYPE);
            const debitAmount =
              amount === "—" || amount.startsWith("-") ? amount : `-${amount}`;
            return (
              <TransactionListItem
                key={`${row.transaction_id}-${index}`}
                icon={IconRecieve as unknown as LucideIcon}
                iconVariant="orange"
                primaryText={row.transaction_id || "—"}
                secondaryText={formatMovementDate(row.transaction_date)}
                amount={debitAmount}
                amountVariant="debit"
              />
            );
          })
        )}
      </div>
    </div>
  );
}
