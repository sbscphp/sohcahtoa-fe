"use client";

import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DetailItem } from "../../../_components/DetailItem";
import { Card, Group, Text, Title } from "@mantine/core";
import TakeActionButton from "@/app/admin/_components/TakeActionButton";
import EmptyState from "@/app/admin/_components/EmptyState";
import Empty from "../../../_components/assets/EmptyTrans.png";
import Image from "next/image";
import type {
  TransactionActionDocumentViewModel,
  TransactionOverviewViewModel,
} from "./hooks/useTransactionDetails";

interface OverviewProps {
  transaction: TransactionOverviewViewModel | null;
  actionDocuments?: TransactionActionDocumentViewModel[];
  transactionId?: string;
  isLoading?: boolean;
  isError?: boolean;
}

const loadingBasicDetails = [
  { label: "Customer Name", value: "--" },
  { label: "Transaction ID", value: "--" },
  { label: "Transaction Date", value: "--" },
  { label: "Transaction Time", value: "--" },
  { label: "Transaction Type", value: "--" },
  { label: "FX Type", value: "--" },
  { label: "Transaction Stage", value: "--" },
  { label: "Workflow Stage", value: "--" },
  { label: "Request Status", value: "--" },
  { label: "Customer Type", value: "--" },
];

const loadingSections = [
  {
    title: "Transaction Details",
    fields: [
      { label: "Transaction Value (FX)", value: "--" },
      { label: "Transaction Value (₦)", value: "--" },
      { label: "Requestor Type", value: "--" },
      { label: "BVN Number", value: "--" },
      { label: "TIN Number", value: "--" },
      { label: "Form A ID", value: "--" },
      { label: "No. of Documents", value: "--" },
      { label: "Pick Up State", value: "--" },
      { label: "Pick Up City", value: "--" },
      { label: "Pickup Location", value: "--" },
    ],
  },
];

export default function Overview({
  transaction,
  actionDocuments = [],
  transactionId,
  isLoading = false,
  isError = false,
}: OverviewProps) {
  const EmptyImg = <Image src={Empty} alt="No Details Available" />;
  const hasData = Boolean(transaction);
  const basicDetailsToRender = isLoading
    ? loadingBasicDetails
    : (transaction?.basicDetails ?? []);
  const sectionsToRender = isLoading
    ? loadingSections
    : (transaction?.sections ?? []);

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

        <TakeActionButton transactionId={transactionId} documents={actionDocuments} />
      </Group>

      {/* Basic Details */}
      <div className="space-y-6">
        <Text fw={600} c="orange" mb={"lg"} className="font-medium! text-lg!">
          Basic Details
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {basicDetailsToRender.map((item) => (
            <DetailItem
              key={item.label}
              label={item.label}
              value={item.value}
              loading={isLoading}
            />
          ))}
        </div>
      </div>

      {sectionsToRender.map((section) => (
        <div className="space-y-6" key={section.title}>
          <Text fw={600} c="orange" mb={"lg"} className="font-medium! text-lg!">
            {section.title}
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {section.fields.map((item) => (
              <DetailItem
                key={`${section.title}-${item.label}`}
                label={item.label}
                value={item.value}
                loading={isLoading}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="space-y-6">
        {!isLoading && (((hasData && transaction?.isEmpty) || !hasData || isError)) && (
          <EmptyState
            title="No Overview Details Available"
            description="This transaction does not have enough detail data to render the overview section yet."
            icon={EmptyImg}
          />
        )}
      </div>
    </Card>
  );
}
