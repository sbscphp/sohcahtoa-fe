"use client";

import type { ReactNode } from "react";

interface BankDetailsFormSectionProps {
  title: string;
  children: ReactNode;
}

export default function BankDetailsFormSection({
  title,
  children,
}: Readonly<BankDetailsFormSectionProps>) {
  return (
    <section className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
      <h3 className="text-body-heading-300 text-base font-semibold">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
