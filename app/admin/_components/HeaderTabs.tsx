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
  /** Optional extra class for the scroll container */
  className?: string;
  /** Allow tabs to wrap instead of clipping on wider layouts */
  wrap?: boolean;
}

export function HeaderTabs({
  value,
  onChange,
  tabs,
  className = "",
  wrap = false,
}: Readonly<HeaderTabsProps>) {
  return (
    <div
      className={`w-full border-b border-gray-100 ${
        wrap
          ? "overflow-visible"
          : "overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      } ${className}`.trim()}
    >
      <div
        className={`flex items-center gap-3 px-5 sm:gap-5 sm:px-6 lg:gap-8 lg:px-8 ${
          wrap ? "flex-wrap" : "min-w-max"
        }`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`relative shrink-0 cursor-pointer whitespace-nowrap px-2 py-4 text-sm font-medium transition-colors sm:px-3 ${
              value === tab.value
                ? "text-primary-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {value === tab.value ? (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
