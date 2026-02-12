export default function ComplianceInsights() {
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
            <span className="text-orange-600 font-semibold">92 %</span>
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Metric
              label="On-time submissions"
              value="426"
              color="text-green-600"
            />
            <Metric
              label="Late submissions"
              value="28"
              color="text-orange-500"
            />
            <Metric
              label="Missed"
              value="6"
              color="text-red-600"
            />
          </div>

          <div className="bg-[#F1F1F1] rounded-md px-4 py-2 flex justify-between text-xs">
            <span >Trend ; <span className="text-green-600">+3% </span> vs last week</span>
            <span className="font-medium">Target - 90%</span>
          </div>
        </div>

        {/* Sanctions Screening Outcomes */}
        <div className="border border-[#E1E0E0] shadow-xs shadow-[#1018280D] rounded-xl p-5 space-y-4">
          <h3 className="font-medium text-gray-700">
            Sanctions Screening Outcomes
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <Metric label="Passed" value="1200" color="text-green-600" />
            <Metric label="Flagged" value="24" color="text-orange-500" />
            <Metric label="Rejected" value="24" color="text-red-600" />
          </div>

          <Metric
            label="Pending review"
            value="10"
            color="text-red-600"
          />

          <div className="bg-[#F1F1F1] rounded-md px-4 py-2 flex justify-between text-xs">
            <span>Total screened</span>
            <span className="font-semibold text-orange-600">1259</span>
          </div>
        </div>

        {/* Cumulative FX Sold */}
        <div className="border border-[#E1E0E0] shadow-xs shadow-[#1018280D] rounded-xl p-5 space-y-4">
          <h3 className="font-medium text-gray-700">
            Cumulative FX sold
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <FxItem label="PTA" value="$150,000" />
            <FxItem label="BTA" value="$200,000" />
            <FxItem label="School" value="$140,000" />
            <FxItem label="Medical" value="$320,000" />
            <FxItem label="Imports" value="$500,000" />
          </div>

          <div className="bg-[#F1F1F1] rounded-md px-4 py-2 flex justify-between text-xs">
            <span>Total (FX) Sold</span>
            <span className="font-semibold">$1,310,000</span>
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
