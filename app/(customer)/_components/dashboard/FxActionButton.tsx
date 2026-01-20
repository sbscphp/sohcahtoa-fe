"use client";

type FxActionButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
};

export default function FxActionButton({ icon, label, onClick }: FxActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-20 w-20 min-w-20 min-h-20 flex-col items-center justify-center gap-4 rounded-[20px] border border-gray-200 bg-white p-2.5 transition-colors hover:border-primary-100 hover:bg-primary-25 cursor-pointer"
    >
      <span className="[&>svg]:size-5 [&>svg]:shrink-0">{icon}</span>
      <span className="text-center text-xs font-medium leading-[120%] text-gray-900">
        {label}
      </span>
    </button>
  );
}
