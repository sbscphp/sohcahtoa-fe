"use client";

import { Group, Text, Divider } from "@mantine/core";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { formatCurrency } from "@/app/utils/helper/formatCurrency";
import type { TransientWalletDetail } from "../hooks/useTransientWalletDetails";
import Link from "next/link";
import { adminRoutes } from "@/lib/adminRoutes";

interface WalletSummaryCardProps {
  wallet: TransientWalletDetail | null;
  isLoading?: boolean;
  onAddNote?: () => void;
  showAddNote?: boolean;
}

export default function WalletSummaryCard({
  wallet,
  isLoading = false,
  onAddNote,
  showAddNote = true,
}: WalletSummaryCardProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Text size="xl" fw={600} className="text-gray-900">
              Wallet ID: {wallet?.walletId ?? "—"}
            </Text>
            <Group gap={8} className="flex-wrap text-sm text-gray-600">
              <span>
                Date Created: {wallet?.dateCreated ?? "—"} |{" "}
                {wallet?.timeCreated ?? "—"}
              </span>
            </Group>
          </div>

          {showAddNote && onAddNote ? (
            <CustomButton buttonType="secondary" onClick={onAddNote}>
              Add Note
            </CustomButton>
          ) : null}
        </div>

        <Divider className="my-2" />

        <section className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <DetailItem
              label="Customer ID"
              value={<Link
                href={adminRoutes.adminCustomerDetails(wallet?.customerId)}
                className="hover:text-[#DD4F05] underline break-all"
              >
                {wallet?.customerId ?? "—"}
              </Link>}
              loading={isLoading}
            />
            <DetailItem
              label="Customer Name"
              value={wallet?.customerName ?? "—"}
              loading={isLoading}
            />
            <DetailItem
              label="Balance"
              value={
                wallet ? formatCurrency(wallet.balance, wallet.currency) : (
                  "—"
                )
              }
              loading={isLoading}
            />
            <DetailItem
              label="Total Debit"
              value={
                wallet ? `-${formatCurrency(wallet.totalDebit)}` : "—"
              }
              loading={isLoading}
            />
            <DetailItem
              label="Total Credit"
              value={
                wallet ? `+${formatCurrency(wallet.totalCredit)}` : "—"
              }
              loading={isLoading}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
