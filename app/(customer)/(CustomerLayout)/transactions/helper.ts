import { normalizeTransactionStatus } from "@/app/(customer)/_lib/transaction-details";
import { Transaction, TransactionListItem } from "@/app/_lib/api/types";
export const TAB_TO_GROUP = {
    "Buy FX": "BUY" as const,
    "Sell FX": "SELL" as const,
    "Receive FX": "REMITTANCE" as const,
  };
  
  export const GROUP_TO_LABEL: Record<string, "Buy FX" | "Sell FX" | "Receive FX"> = {
    BUY: "Buy FX",
    SELL: "Sell FX",
    REMITTANCE: "Receive FX",
  };
  
export function mapListItemToTransaction(item: TransactionListItem): Transaction {
    return {
      id: item.id,
      referenceNumber: item.referenceNumber,
      date: item.createdAt,
      type: item.type,
      stage: item.currentStep,
      status: normalizeTransactionStatus(item.status),
      transaction_type: GROUP_TO_LABEL[item.group] ?? "Buy FX",
    };
  }
  
  export function normalizeStage(value: string) {
    return (value ?? "")
      .toLowerCase()
      .trim()
      .replaceAll(" ", "_")
      .replaceAll("-", "_");
  }
  
  export function toQueryValue(values?: string[]) {
    return values?.length ? values.join(",") : undefined;
  }
  