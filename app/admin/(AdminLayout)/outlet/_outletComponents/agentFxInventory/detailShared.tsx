"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, Group, Select, Skeleton, Text } from "@mantine/core";
import { ChevronDown, Clock, Coins, ListFilter, Scale, Upload } from "lucide-react";
import CurrencySelector from "@/app/admin/_components/CurrencySelector";
import StatCard from "@/app/admin/_components/StatCard";
import { CURRENCIES } from "@/app/admin/_lib/constants";
import { getCurrencyFlagUrl } from "@/app/admin/_lib/currency";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";
import type { AmountCell } from "../../_data/agentFxInventoryMock";
import { useFxInventoryAgentOverview } from "../../hooks/useFxInventoryAgentOverview";

const PAGE_SIZE = 6;

export const RECONCILED_COLOR = "#027A48";
export const VARIANCE_COLOR = "#B54708";
export const CONFIRMED_COLOR = "#027A48";
export const FLAGGED_COLOR = "#B42318";

type CurrencyCode = (typeof CURRENCIES)[number]["code"];

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export function AmountText({ value, strong = false }: { value: AmountCell; strong?: boolean }) {
  return (
    <Text
      size="sm"
      fw={strong || value.tone === "negative" ? 600 : 400}
      c={value.tone === "negative" ? "red.6" : value.tone === "muted" ? "dimmed" : undefined}
    >
      {value.text}
    </Text>
  );
}

export function TimestampCell({ date, time }: { date: string; time: string }) {
  return (
    <div>
      <Text size="sm">{date}</Text>
      <Text size="xs" c="dimmed">
        {time}
      </Text>
    </div>
  );
}

export function TypeCell({ type }: { type: string }) {
  const [first, ...rest] = type.split(" ");
  return (
    <div>
      <Text size="sm">{first}</Text>
      {rest.length > 0 ? <Text size="sm">{rest.join(" ")}</Text> : null}
    </div>
  );
}

export function CurrencyLabel({ code, label }: { code?: string; label: string }) {
  const flag = code ? getCurrencyFlagUrl(code) : null;
  return (
    <div className="flex items-center gap-2">
      {flag ? (
        <span className="relative h-4 w-6 overflow-hidden rounded-sm">
          <Image src={flag} alt="" width={24} height={16} className="h-4 w-6 object-cover" />
        </span>
      ) : null}
      <Text size="sm" fw={500}>
        {label}
      </Text>
    </div>
  );
}

function PeriodControls() {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  return (
    <Group gap="sm">
      <CurrencySelector readOnly={true} mode="secondary" value={currency} onChange={setCurrency} />
      <Button variant="default" radius="xl" rightSection={<ChevronDown size={14} />}>
        Date: Today
      </Button>
    </Group>
  );
}

function isCurrencyCode(value?: string): value is CurrencyCode {
  return CURRENCIES.some((currency) => currency.code === value);
}

function moneyLabel(amount: number | null | undefined, currency: string, isError: boolean) {
  if (isError || amount === null || amount === undefined) return "—";
  return formatCurrency(amount, currency) || "—";
}

function pendingLabel(count: number | null | undefined, isError: boolean) {
  if (isError || count === null || count === undefined) return "—";
  return `${count} ${count === 1 ? "Transaction" : "Transactions"}`;
}

export function InventoryOverview({ agentId }: { agentId: string }) {
  const { overview, isLoading, isError } = useFxInventoryAgentOverview(agentId);
  const currency = isCurrencyCode(overview?.currency) ? overview.currency : "USD";

  return (
    <section className="rounded-xl bg-white p-5">
      <Group justify="space-between" align="center" wrap="wrap" mb="md">
        <h2 className="text-base font-semibold">Inventory Overview</h2>
        <Group gap="sm">
          <CurrencySelector readOnly mode="secondary" value={currency} />
          <Button variant="default" radius="xl" rightSection={<ChevronDown size={14} />}>
            Date: Today
          </Button>
        </Group>
      </Group>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          <>
            <Skeleton height={72} radius="md" />
            <Skeleton height={72} radius="md" />
            <Skeleton height={72} radius="md" />
            <Skeleton height={72} radius="md" />
          </>
        ) : (
          <>
            <StatCard
              title="Available FX Inventory"
              value={moneyLabel(overview?.availableFxInventory, currency, isError)}
              icon={<Coins className="h-5 w-5 text-primary-400" />}
              iconBg="bg-primary-00"
            />
            <StatCard
              title="NGN Cash Available"
              value={moneyLabel(overview?.ngnCashAvailable, "NGN", isError)}
              icon={<Coins className="h-5 w-5 text-primary-300" />}
              iconBg="bg-primary-00"
            />
            <StatCard
              title="Pending Settlements"
              value={pendingLabel(overview?.pendingSettlements, isError)}
              icon={<Clock className="h-5 w-5 text-yellow-600" />}
              iconBg="bg-yellow-100"
            />
            <StatCard
              title="Cash Lodgement"
              value={moneyLabel(overview?.cashLodgement, "NGN", isError)}
              icon={<Scale className="h-5 w-5 text-blue-600" />}
              iconBg="bg-blue-100"
            />
          </>
        )}
      </div>
    </section>
  );
}

export function TransactionOverview() {
  return (
    <section className="rounded-xl bg-white p-5">
      <Group justify="space-between" align="center" wrap="wrap" mb="md">
        <h2 className="text-base font-semibold">Transaction Overview</h2>
        <PeriodControls />
      </Group>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total FX Purchased"
          value="$18,650"
          icon={<Coins className="h-5 w-5 text-primary-400" />}
          iconBg="bg-primary-00"
        />
        <StatCard
          title="Total FX Sold"
          value="$41,200"
          icon={<Coins className="h-5 w-5 text-primary-300" />}
          iconBg="bg-primary-00"
        />
        <StatCard
          title="Total Transactions"
          value="178"
          icon={<Coins className="h-5 w-5 text-primary-400" />}
          iconBg="bg-primary-00"
        />
      </div>
    </section>
  );
}

export function FilterSelect({
  value,
  data,
  onChange,
}: {
  value: string | null;
  data: string[];
  onChange: (value: string | null) => void;
}) {
  return (
    <Select
      value={value}
      onChange={onChange}
      data={data}
      placeholder="Filter By"
      clearable
      radius="xl"
      w={140}
      rightSection={<ListFilter size={16} />}
    />
  );
}

export function ExportButton({
  onClick,
  loading = false,
}: {
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <Button
      variant="outline"
      color="#E36C2F"
      radius="xl"
      rightSection={<Upload size={16} />}
      onClick={onClick}
      loading={loading}
      disabled={loading}
    >
      Export
    </Button>
  );
}

export function paginate<T>(rows: T[], page: number) {
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  return {
    totalPages,
    currentPage,
    rows: rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
  };
}
