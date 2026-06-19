import { TableFilterGroup } from "../../_components/common/table/TableFilterSheet";
import { TRANSACTION_STATUS_FILTER_OPTIONS } from "@/app/(customer)/_lib/transaction-details";
export { TRANSACTION_GROUP_FILTER_OPTIONS as FILTER_OPTIONS } from "@/app/(customer)/_lib/transaction-group-tabs";

export const TX_FILTER_OPTIONS: TableFilterGroup[] = [
    {
        label: "Filter By Status",
        key: "status",
        type: "single",
        placeholder: "All statuses",
        options: TRANSACTION_STATUS_FILTER_OPTIONS,
    },
    {
        label: "Filter By Transaction Type",
        key: "transactionType",
        type: "multi",
        options: [
            { label: "PTA", value: "pta" },
            { label: "BTA", value: "bta" },
            { label: "Tourist", value: "tourist" },
            { label: "School Fees", value: "school_fees" },
            { label: "Professional Body", value: "professional_body" },
            { label: "IMTO", value: "imto" },
            { label: "Medical", value: "medical" },
        ],
    },
    {
        label: "Filter By Transaction Stage",
        key: "stage",
        type: "multi",
        options: [
            { label: "Documentation", value: "documentation" },
            { label: "Awaiting Disbursement", value: "awaiting_disbursement" },
            { label: "Transaction settlement", value: "transaction_settlement" },
        ],
    },
    { label: "Filter By Date", key: "dateRange", type: "dateRange" },
];
