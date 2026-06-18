import type { TableFilterGroup } from "@/app/(customer)/_components/common/table/TableFilterSheet";

export const TRANSIENT_HISTORY_FILTER_OPTIONS: TableFilterGroup[] = [
  {
    label: "Type",
    key: "type",
    type: "single",
    placeholder: "All types",
    options: [
      { label: "Debit", value: "DEBIT" },
      { label: "Credit", value: "CREDIT" },
    ],
  },
  { label: "Filter By Date", key: "dateRange", type: "dateRange" },
];
