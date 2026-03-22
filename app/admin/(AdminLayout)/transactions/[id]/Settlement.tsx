"use client";

import EmptyState from "@/app/admin/_components/EmptyState";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DetailItem } from "../../../_components/DetailItem";
import { Card, Group, Text, Title } from "@mantine/core";
import TakeActionButton from "@/app/admin/_components/TakeActionButton";
import Empty from "../../../_components/assets/EmptyTrans.png";
import Image from "next/image";
import { ArrowUpRight, File } from "lucide-react";
import type { TransactionSettlementViewModel } from "./hooks/useTransactionDetails";

interface SettlementProps {
  transaction: TransactionSettlementViewModel | null;
  isLoading?: boolean;
  isError?: boolean;
}

const loadingFields = [
  { label: "Settlement ID", value: "--" },
  { label: "Settled By", value: "--" },
  { label: "Settlement Date", value: "--" },
  { label: "Settlement Time", value: "--" },
  { label: "Total Settlement (FX)", value: "--" },
  { label: "Total Settlement (₦)", value: "--" },
  { label: "Settlement Structure (Cash)", value: "--" },
  { label: "Settlement Structure (Prepaid Card)", value: "--" },
  { label: "Settlement Status", value: "--" },
];

export default function Settlement({
  transaction,
  isLoading = false,
  isError = false,
}: SettlementProps) {
  const EmptyImg = <Image src={Empty} alt="No Details Available" />;
  const hasData = Boolean(transaction);
  const fieldsToRender = isLoading ? loadingFields : (transaction?.fields ?? []);
  return (
    <Card radius="lg" p="xl" className="m-5 bg-[#F7F7F7]">
      {/* Header */}
      <Group justify="space-between" align="flex-start" mb="xl">
        <div>
          <Title order={4} className="text-body-heading-300 font-medium! text-2xl!">
            <span className="font-medium text-body-text-50 ">
              {isLoading ? "Loading" : (transaction?.titlePrefix ?? "--")}:
            </span>{" "}
            {isLoading ? "Transaction Details" : (transaction?.titleValue ?? "--")}
          </Title>

          <Group gap="xs" mt={4}>
            <Text c="dimmed" className="text-body-text-200">
              {isLoading ? "-- | --" : `${transaction?.dateLabel ?? "--"} | ${transaction?.timeLabel ?? "--"}`}
            </Text>
            <StatusBadge status={isLoading ? "Loading" : (transaction?.statusLabel ?? "--")} size="sm" />
          </Group>
        </div>

        <TakeActionButton />
      </Group>

      <div className="space-y-6">
        <Text fw={600} c="orange" mb="lg" className="font-medium! text-lg!">
          Settlement Details
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {fieldsToRender.map((item) => (
            <DetailItem key={item.label} label={item.label} value={item.value} loading={isLoading} />
          ))}

          {(isLoading || transaction?.receipt) && (
            <div className="space-y-1 md:col-span-2">
              <Text size="xs" className="text-body-text-50!" mb={4}>
                Settlement Receipt
              </Text>
              {isLoading ? (
                <div className="h-16 rounded-md border border-gray-300 bg-gray-200/60 animate-pulse" />
              ) : (
                <a
                  href={transaction?.receipt?.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-2 mt-3 p-2 border border-gray-300 rounded-md cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#FFF6F1] border-4 border-[#FFFAF8] rounded-3xl ">
                      <File size={16} color="#DD4F05" />
                    </div>
                    <div>
                      <Text fw={500} className="text-body-heading-300">
                        {transaction?.receipt?.title ?? "Settlement Receipt"}
                      </Text>
                      <Text size="xs" className="text-body-text-50!">
                        {transaction?.receipt?.fileSize ?? "--"}
                      </Text>
                    </div>
                  </div>
                  <ArrowUpRight size={16} color="#DD4F05" className="mt-2 ml-auto" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 mb-6">
        {!isLoading && (((hasData && transaction?.isEmpty) || !hasData || isError)) && (
          <EmptyState
            title="Settlement is pending"
            description="Transaction Settlement process is pending for now."
            icon={EmptyImg}
          />
        )}
      </div>
    </Card>
  );
}
