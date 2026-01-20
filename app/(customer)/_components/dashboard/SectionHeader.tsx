"use client";

type SectionHeaderProps = {
  title: string;
  action?: React.ReactNode;
};

export default function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-[#4D4B4B]">{title}</h2>
      {action}
    </div>
  );
}
