import { TableFilterGroup } from "../../_components/common/table/TableFilterSheet";

export const TX_FILTER_OPTIONS: TableFilterGroup[] = [
    {
        label: "Filter By Status",
        key: "status",
        type: "single",
        options: [
            { label: "Pending", value: "pending" },
            { label: "Completed", value: "completed" },
            { label: "Rejected", value: "rejected" },
            { label: "Approved", value: "approved" },
            { label: "Requested more info", value: "request_more_info" },
        ],
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