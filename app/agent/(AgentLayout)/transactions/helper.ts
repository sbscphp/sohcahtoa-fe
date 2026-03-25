import { TransactionListItem } from "@/app/_lib/api/types";
import { Transaction } from "./types";
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
  
export function mapApiStatusToDisplay(apiStatus: string) {
    const s = apiStatus?.toUpperCase() ?? "";
    if (s === "COMPLETED" || s === "APPROVED") return "Completed";
    if (s === "REJECTED") return "Rejected";
    if (s === "REQUEST_MORE_INFO") return "Request More Info";
    return "Pending";
  }
  
  export function mapListItemToTransaction(item: TransactionListItem): Transaction {
    return {
      id: item.transaction_id ?? "",
      referenceNumber: item.referenceNumber,
      date: item.transaction_date,
      type: item.transaction_type,
      stage: item.transaction_stage,
      status: mapApiStatusToDisplay(item.transaction_status ?? ""),
      transaction_type: GROUP_TO_LABEL[item.group],
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
  