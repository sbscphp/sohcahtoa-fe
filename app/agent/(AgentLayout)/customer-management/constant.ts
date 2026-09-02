import type { TableFilterGroup } from "@/app/(customer)/_components/common/table/TableFilterSheet";

export type AgentCustomerFilterKey =
  | "segment"
  | "status"
  | "customerType"
  | "lastTransactionType";

export const AGENT_CUSTOMER_FILTER_OPTIONS: TableFilterGroup[] = [
  {
    label: "Filter By Segment",
    key: "segment",
    type: "single",
    placeholder: "All customers",
    options: [
      { label: "All", value: "ALL" },
      { label: "Verified", value: "VERIFIED" },
      { label: "Returning", value: "RETURNING" },
      { label: "Pending KYC", value: "PENDING_KYC" },
    ],
  },
  {
    label: "Filter By KYC Status",
    key: "status",
    type: "single",
    placeholder: "All statuses",
    options: [
      { label: "Not started", value: "NOT_STARTED" },
      { label: "In progress", value: "IN_PROGRESS" },
      { label: "Pending verification", value: "PENDING_VERIFICATION" },
      { label: "Verified", value: "VERIFIED" },
      { label: "Rejected", value: "REJECTED" },
    ],
  },
  {
    label: "Filter By Customer Type",
    key: "customerType",
    type: "single",
    placeholder: "All types",
    options: [
      { label: "Resident", value: "NIGERIAN_CITIZEN" },
      { label: "Tourist", value: "TOURIST" },
      { label: "Expatriate", value: "EXPATRIATE" },
    ],
  },
  {
    label: "Filter By Last Transaction Type",
    key: "lastTransactionType",
    type: "single",
    placeholder: "All transaction types",
    options: [
      { label: "PTA", value: "PTA" },
      { label: "BTA", value: "BTA" },
      { label: "School Fees", value: "SCHOOL_FEES" },
      { label: "Medical", value: "MEDICAL" },
      { label: "Professional Body", value: "PROFESSIONAL_BODY" },
      { label: "Tourist FX", value: "TOURIST_FX" },
      { label: "Resident FX", value: "RESIDENT_FX" },
      { label: "Expatriate FX", value: "EXPATRIATE_FX" },
      { label: "IMTO Remittance", value: "IMTO_REMITTANCE" },
      { label: "Cash Remittance", value: "CASH_REMITTANCE" },
    ],
  },
  { label: "Filter By Date Registered", key: "dateRange", type: "dateRange" },
];
