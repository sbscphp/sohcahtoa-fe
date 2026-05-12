"use client";

type SectionHeaderProps = {
  title: string;
  action?: React.ReactNode;
};

export default function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
      <h2 className="text-base font-medium text-heading-100">{title}</h2>
      {action}
    </div>
  );
}
