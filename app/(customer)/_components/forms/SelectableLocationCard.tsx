"use client";

interface SelectableLocationCardProps {
  name: string;
  address: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function SelectableLocationCard({
  name,
  address,
  isSelected,
  onClick,
}: SelectableLocationCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex flex-row items-start p-4 gap-4 min-h-[72px] rounded-lg border transition-all ${
        isSelected
          ? "border border-primary-400 bg-[#FFF6F1]"
          : "border-[1.5px] border-gray-100 bg-white hover:border-gray-200"
      }`}
    >
      <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
        <span className="text-sm font-medium leading-5 text-[#4D4B4B]">
          {name}
        </span>
        <span className="text-sm font-normal leading-5 text-[#8F8B8B]">
          {address}
        </span>
      </div>
    </button>
  );
}
