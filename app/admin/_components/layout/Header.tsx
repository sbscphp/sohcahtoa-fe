'use client';

import { Bell, Settings, CircleAlert } from "lucide-react"

type HeaderProps = {
  title?: string;
  rightContent?: React.ReactNode;
  collapsed: boolean;
}

export default function Header({ title, rightContent, collapsed }: HeaderProps) {
  return (
    <header className="h-16 bg-white shadow px-6 flex items-center justify-between w-full">
      <h1 className="text-lg font-semibold">{title}</h1>

      <div className="flex items-center gap-4">
        <button className="relative flex items-center justify-center w-8 h-8 rounded-full border border-[#F2F4F7] hover:bg-gray-50 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
            2
          </span>
        </button>
        <button className="relative flex items-center justify-center w-8 h-8 rounded-full border border-[#F2F4F7] hover:bg-gray-50 transition-colors">
          <Settings size={20} />
        </button>
        <button className="relative flex items-center justify-center w-8 h-8 rounded-full border border-[#F2F4F7] hover:bg-gray-50 transition-colors">
          <CircleAlert size={20} />
        </button>
      </div>
    </header>
  );
}
