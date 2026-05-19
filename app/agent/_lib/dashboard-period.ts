import type { AgentDashboardCashStatsPeriod } from "@/app/_lib/api/types";

/** Shared period presets for agent dashboard balance & cash-stats APIs */
export const AGENT_DASHBOARD_PERIOD_OPTIONS: Array<{
  value: AgentDashboardCashStatsPeriod;
  label: string;
}> = [
  { value: "last_month", label: "Last Month" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "last_6_months", label: "Last 6 Months" },
  { value: "last_year", label: "Last Year" },
];

/** Default for FX inventory cash-stats summary */
export const DEFAULT_AGENT_DASHBOARD_PERIOD: AgentDashboardCashStatsPeriod =
  "last_3_months";

/** Default for dashboard cash overview balance */
export const DEFAULT_AGENT_BALANCE_PERIOD: AgentDashboardCashStatsPeriod =
  "last_month";
