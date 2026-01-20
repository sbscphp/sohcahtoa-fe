"use client";

import { Plus } from "lucide-react";

type AddCardButtonProps = {
  onClick?: () => void;
};

export default function AddCardButton({ onClick }: AddCardButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center justify-center rounded-[20px] border border-dashed border-[#232323] bg-[#FAFAFA] px-3 py-[9px] transition-opacity hover:opacity-80"
      style={{ width: 60, height: 156 }}
    >
      <Plus className="h-6 w-6 text-[#232323]" size={24} />
    </button>
  );
}
