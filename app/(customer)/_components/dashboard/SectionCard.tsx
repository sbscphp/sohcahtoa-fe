"use client";

type SectionCardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionCard({ children, className = "" }: SectionCardProps) {
  return (
    <div
      className={`rounded-xl bg-white p-6 shadow-xs ${className}`}
    >
      {children}
    </div>
  );
}
