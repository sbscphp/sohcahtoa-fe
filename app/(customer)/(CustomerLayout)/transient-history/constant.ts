import type { TableFilterGroup } from "@/app/(customer)/_components/common/table/TableFilterSheet";

export const TRANSIENT_HISTORY_FILTER_OPTIONS: TableFilterGroup[] = [
  { label: "Filter By Date", key: "dateRange", type: "dateRange" },
];
