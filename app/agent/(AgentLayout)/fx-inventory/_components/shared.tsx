"use client";

import type { MouseEvent, ReactNode } from "react";
import Image from "next/image";
import { ActionIcon, Button } from "@mantine/core";
import { HugeiconsIcon } from "@hugeicons/react";
import { UploadIcon } from "@hugeicons/core-free-icons";
import { IconArrowRight } from "@/components/icons/IconArrowRight";
import PaginatedTable, { type PaginatedTableColumn } from "@/app/agent/_components/common/table/PaginatedTable";
import { getCurrencyFlagUrl } from "@/app/(customer)/_lib/currency";
import { formatSigned, splitDateTime } from "../_lib/format-fx";

export function CurrencyCell({ code }: Readonly<{ code: string }>) {
  const flag = getCurrencyFlagUrl(code);
  return (
    <div className="flex items-center gap-2">
      {flag ? (
        <Image src={flag} alt="" width={20} height={20} unoptimized className="size-5 rounded-full object-cover" />
      ) : null}
      <span className="text-sm font-medium text-body-text-300">{code}</span>
    </div>
  );
}

export function SignedAmount({ value, currency }: Readonly<{ value: number; currency: string }>) {
  const tone = value > 0 ? "text-green-600" : value < 0 ? "text-red-600" : "text-body-text-300";
  return <span className={`text-sm font-medium ${tone}`}>{formatSigned(value, currency)}</span>;
}

export function DateTimeCell({ iso }: Readonly<{ iso: string }>) {
  const { date, time } = splitDateTime(iso);
  return (
    <div className="text-sm leading-5 text-body-text-200">
      <p>{date}</p>
      <p className="text-xs text-body-text-50">{time}</p>
    </div>
  );
}

export function RowArrowButton({
  onClick,
  label,
}: Readonly<{ onClick: (e: MouseEvent<HTMLButtonElement>) => void; label: string }>) {
  return (
    <ActionIcon
      radius="md"
      variant="light"
      w={40}
      h={40}
      className="bg-[#FFF6F1]! border border-[#FFF6F1]!"
      style={{ boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)", padding: "10px" }}
      onClick={onClick}
      aria-label={label}
    >
      <IconArrowRight className="w-8 h-8" />
    </ActionIcon>
  );
}

export function SummaryTile({
  label,
  value,
  tone = "default",
}: Readonly<{ label: string; value: ReactNode; tone?: "default" | "danger" }>) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
      <p className="text-xs text-body-text-50">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone === "danger" ? "text-primary-400" : "text-body-text-400"}`}>
        {value}
      </p>
    </div>
  );
}

export function SummaryTiles({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{children}</div>;
}

/** Tighter cell padding than the shared table default (24px) so wide inventory grids fit without scrolling. */
const TIGHT = "[&&]:sm:pl-3! [&&]:sm:pr-3!";

const outlineBtn =
  "h-10 gap-1.5 border-text-50! bg-white! px-4 py-2.5 font-medium text-sm leading-5 text-[#4D4B4B]! hover:border-[#E88A58]! hover:bg-[#FFF6F1]! hover:text-[#E36C2F]!";

export function ExportButton({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <Button
      variant="outline"
      size="sm"
      radius="xl"
      rightSection={<HugeiconsIcon icon={UploadIcon} className="h-3.5 w-3.5" />}
      onClick={onClick}
      className={outlineBtn}
    >
      Export
    </Button>
  );
}

/** Titled card with an action slot (Export by default) wrapping a table. */
export function InventorySection<T>({
  title,
  subtitle,
  action,
  onExport,
  data,
  columns,
  keyExtractor,
  emptyMessage,
  onRowClick,
}: Readonly<{
  title: string;
  subtitle: string;
  action?: ReactNode;
  onExport?: () => void;
  data: T[];
  columns: PaginatedTableColumn<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}>) {
  return (
    <div className="min-w-0 space-y-4 rounded-2xl border border-gray-100 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-body-heading-300">{title}</h2>
          <p className="text-xs text-body-text-50">{subtitle}</p>
        </div>
        {action ?? (onExport ? <ExportButton onClick={onExport} /> : null)}
      </div>
      <PaginatedTable
        data={data}
        columns={columns.map((c) => ({
          ...c,
          className: `${TIGHT} ${c.className ?? ""}`,
          headerClassName: `${TIGHT} ${c.headerClassName ?? ""}`,
        }))}
        keyExtractor={keyExtractor}
        onRowClick={onRowClick}
        emptyTitle="No data available yet"
        emptyMessage={emptyMessage ?? "Nothing to show here yet."}
      />
    </div>
  );
}

export function StatusPill({
  label,
  tone,
}: Readonly<{ label: string; tone: "success" | "warning" | "danger" }>) {
  const styles = {
    success: "bg-green-50 text-green-700",
    warning: "bg-orange-50 text-primary-400",
    danger: "bg-red-50 text-red-600",
  } as const;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[tone]}`}>
      {label}
    </span>
  );
}
