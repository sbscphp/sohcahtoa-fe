"use client";

export interface HeaderTabItem {
  value: string;
  label: string;
}

interface HeaderTabsProps {
  /** Current active tab value */
  value: string;
  /** Called when a tab is selected */
  onChange: (value: string) => void;
  /** List of tabs */
  tabs: HeaderTabItem[];
  /** Optional extra class for the container */
  className?: string;
}

export function HeaderTabs({ value, onChange, tabs, className = "" }: HeaderTabsProps) {
  return (
    <div className={`flex items-center gap-6 px-6 ${className}`.trim()}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`relative px-1 pb-3 cursor-pointer hover:text-primary-500 text-sm font-medium transition-colors ${
            value === tab.value
              ? "text-primary-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
          {value === tab.value && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
          )}
        </button>
      ))}
    </div>
  );
}
