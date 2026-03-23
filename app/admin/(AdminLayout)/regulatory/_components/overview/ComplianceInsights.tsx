import type { AdminComplianceDashboardData } from "@/app/admin/_services/admin-api";

interface ComplianceInsightsProps {
  insights: AdminComplianceDashboardData["insights"];
  loading?: boolean;
}

function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

function formatPercent(value: number): string {
  return `${value.toLocaleString("en-US")}%`;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}

export default function ComplianceInsights({ insights, loading = false }: ComplianceInsightsProps) {
  const display = {
    slaRate: loading ? "--" : formatPercent(insights.sla.complianceRate),
    onTime: loading ? "--" : formatCount(insights.sla.onTime),
    late: loading ? "--" : formatCount(insights.sla.late),
    missed: loading ? "--" : formatCount(insights.sla.missed),
    trend: loading ? "--" : `${insights.sla.trend.delta >= 0 ? "+" : ""}${insights.sla.trend.delta}%`,
    target: loading ? "--" : formatPercent(insights.sla.target),
    passed: loading ? "--" : formatCount(insights.screening.passed),
    flagged: loading ? "--" : formatCount(insights.screening.flagged),
    rejected: loading ? "--" : formatCount(insights.screening.rejected),
    pendingReview: loading ? "--" : formatCount(insights.screening.pendingReview),
    totalScreened: loading ? "--" : formatCount(insights.screening.totalScreened),
    pta: loading ? "--" : formatCurrency(insights.fxSold.PTA),
    bta: loading ? "--" : formatCurrency(insights.fxSold.BTA),
    school: loading ? "--" : formatCurrency(insights.fxSold.School),
    medical: loading ? "--" : formatCurrency(insights.fxSold.Medical),
    imports: loading ? "--" : formatCurrency(insights.fxSold.Imports),
    total: loading ? "--" : formatCurrency(insights.fxSold.total),
  };

  return (
    <div className="bg-white rounded-xl p-6 my-6">
      {/* Header */}
      <h2 className="text-lg font-semibold mb-6">Compliance Insights</h2>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Compliance SLA Tracker */}
        <div className="border border-[#E1E0E0] shadow-xs shadow-[#1018280D] rounded-xl p-5 space-y-4">
          <h3 className="font-medium text-gray-700">
            Compliance SLA Tracker
          </h3>

          <p className="text-sm text-gray-500">
            SLA compliance rate{" "}
            <span className="text-orange-600 font-semibold">{display.slaRate}</span>
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Metric
              label="On-time submissions"
              value={display.onTime}
              color="text-green-600"
            />
            <Metric
              label="Late submissions"
              value={display.late}
              color="text-orange-500"
            />
            <Metric
              label="Missed"
              value={display.missed}
              color="text-red-600"
            />
          </div>

          <div className="bg-[#F1F1F1] rounded-md px-4 py-2 flex justify-between text-xs">
            <span>
              Trend ;{" "}
              <span className={insights.sla.trend.delta >= 0 ? "text-green-600" : "text-red-600"}>
                {display.trend}{" "}
              </span>
              vs last week
            </span>
            <span className="font-medium">Target - {display.target}</span>
          </div>
        </div>

        {/* Sanctions Screening Outcomes */}
        <div className="border border-[#E1E0E0] shadow-xs shadow-[#1018280D] rounded-xl p-5 space-y-4">
          <h3 className="font-medium text-gray-700">
            Sanctions Screening Outcomes
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <Metric label="Passed" value={display.passed} color="text-green-600" />
            <Metric label="Flagged" value={display.flagged} color="text-orange-500" />
            <Metric label="Rejected" value={display.rejected} color="text-red-600" />
          </div>

          <Metric
            label="Pending review"
            value={display.pendingReview}
            color="text-red-600"
          />

          <div className="bg-[#F1F1F1] rounded-md px-4 py-2 flex justify-between text-xs">
            <span>Total screened</span>
            <span className="font-semibold text-orange-600">{display.totalScreened}</span>
          </div>
        </div>

        {/* Cumulative FX Sold */}
        <div className="border border-[#E1E0E0] shadow-xs shadow-[#1018280D] rounded-xl p-5 space-y-4">
          <h3 className="font-medium text-gray-700">
            Cumulative FX sold
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <FxItem label="PTA" value={display.pta} />
            <FxItem label="BTA" value={display.bta} />
            <FxItem label="School" value={display.school} />
            <FxItem label="Medical" value={display.medical} />
            <FxItem label="Imports" value={display.imports} />
          </div>

          <div className="bg-[#F1F1F1] rounded-md px-4 py-2 flex justify-between text-xs">
            <span>Total (FX) Sold</span>
            <span className="font-semibold">{display.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------
 Reusable Components
----------------------------- */
function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <p className={`text-xs text-gray-500 ${color}`}>{label}</p>
      <p className={`text-base font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function FxItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
