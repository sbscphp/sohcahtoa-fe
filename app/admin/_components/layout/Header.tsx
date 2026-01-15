'use client';

import { Bell, Settings, CircleAlert, ChevronLeft, Menu } from "lucide-react"
import { useMediaQuery } from '@mantine/hooks';

type HeaderProps = {
  title?: string;
  rightContent?: React.ReactNode;
  collapsed: boolean;
  setCollapsed: () => void;
  toggleMobile?: () => void;
}

export default function Header({ title, collapsed, setCollapsed, toggleMobile }: HeaderProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <header className="h-16 bg-white shadow px-6 flex items-center justify-between w-full relative">
      <div className="flex items-center gap-4">
        {isMobile && toggleMobile ? (
          <button
            onClick={toggleMobile}
            className="rounded-full w-8 h-8 border-[0.5px] border-[#F2F4F7] flex items-center justify-center hover:bg-gray-100 drop-shadow shadow-sm shadow-[#0002057A] transition-colors"
          >
            <Menu size={20} />
          </button>
        ) : (
          <button
            onClick={setCollapsed}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full w-8 h-8 border-[0.5px] border-[#F2F4F7] flex items-center justify-center hover:bg-gray-100 drop-shadow shadow-sm shadow-[#0002057A] transition-colors z-50 bg-white"
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

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
