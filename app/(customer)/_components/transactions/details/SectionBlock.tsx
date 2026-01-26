"use client";

import { ReactNode } from "react";

const sectionTitleClass =
  "font-medium text-lg leading-[26px] text-[#DD4F05]";

interface SectionBlockProps {
  title: string;
  children: ReactNode;
}

export default function SectionBlock({ title, children }: SectionBlockProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center px-8">
        <h3 className={sectionTitleClass}>{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 px-8">
        {children}
      </div>
    </div>
  );
}
