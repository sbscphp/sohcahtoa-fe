"use client";

type FilterPillsProps = {
  items: { id: string; label: string }[];
  activeId: string;
  onSelect: (id: string) => void;
};

export default function FilterPills({ items, activeId, onSelect }: FilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            activeId === item.id
              ? "border-transparent bg-primary-400 text-white"
              : "border-gray-200 bg-white text-[#4D4B4B] hover:border-gray-300"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
