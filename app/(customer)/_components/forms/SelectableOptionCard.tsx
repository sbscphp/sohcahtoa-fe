"use client";

interface SelectableOptionCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function SelectableOptionCard({
  icon,
  title,
  description,
  isSelected,
  onClick,
}: SelectableOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex flex-row items-center gap-3 p-4 rounded-lg border transition-all ${
        isSelected
          ? "border border-primary-400 bg-[#FFF6F1]"
          : "border-[1.5px] border-gray-100 bg-white hover:border-gray-200"
      }`}
    >
      {icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center text-[#8F8B8B]">
          {icon}
        </div>
      )}
      <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-medium leading-5 text-[#4D4B4B]">
          {title}
        </span>
        {description && (
          <span className="text-xs font-normal leading-4 text-[#8F8B8B]">
            {description}
          </span>
        )}
      </div>
    </button>
  );
}
