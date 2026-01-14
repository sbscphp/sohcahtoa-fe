import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value?: number | string;
  icon: ReactNode;
  iconBg: string;
  isEmpty?: boolean;
}

export default function StatCard({
  title,
  value,
  icon,
  iconBg,
  isEmpty = false,
}: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          isEmpty ? "bg-gray-100" : iconBg
        }`}
      >
        {icon}
      </div>

      <div>
        <p className="text-sm text-gray-500">{title}</p>

        {isEmpty ? (
          <p className="text-sm text-gray-400 italic">0</p>
        ) : (
          <p className="text-lg font-semibold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}
