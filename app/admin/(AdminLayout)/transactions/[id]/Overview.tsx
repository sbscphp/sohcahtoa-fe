"use client";

import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DetailItem } from "../_transactionsComponents/DetailItem";
import { Card, Group, Text, Title, Button } from "@mantine/core";
import { useState } from "react";
import TakeActionOverlay from "./TakeActionOverlay";
import EmptyState from "@/app/admin/_components/EmptyState";
import Empty from "../../../_components/assets/EmptyTrans.png";
import Image from "next/image";

export default function Overview({ isEmpty }: { isEmpty?: boolean }) {
  const [opened, setOpened] = useState(false);
  const EmptyImg = <Image src={Empty} alt="No Details Available" />;

  return (
    <Card radius="lg" p="xl" className="m-5 bg-[#F7F7F7]">
      {/* Header */}
      <Group justify="space-between" align="flex-start" mb="xl">
        <div>
          <Title order={4} className="text-body-heading-300 font-medium! text-2xl!">
            <span className="font-medium text-body-text-50 ">Buy FX:</span>{" "}
            Business Travel Allowance
          </Title>

          <Group gap="xs" mt={4}>
            <Text c="dimmed" className="text-body-text-200">
              Nov 17 2025 | 11:00am
            </Text>
            <StatusBadge status="Pending" size="xs" />
          </Group>
        </div>

        <Button color="#DD4F05" radius="xl" size="lg" onClick={() => setOpened(true)}>
          Take Action
        </Button>
        <TakeActionOverlay opened={opened} onClose={() => setOpened(false)} />
      </Group>

      {/* Basic Details */}
      <div className="space-y-6">
        <Text fw={600} c="orange" mb={"lg"} className="font-medium! text-lg!">
          Basic Details
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <DetailItem label="Customer Name" value="Saliu Cairo Fatia" />
          <DetailItem label="Transaction ID" value="6783GHA" />
          <DetailItem label="Transaction Date" value="Nov 19 2025" />
          <DetailItem label="Transaction Time" value="11:00 am." />

          <DetailItem label="Transaction Type" value="BTA" />
          <DetailItem label="FX Type" value="Buy FX" />
          <DetailItem
            label="Transaction Stage"
            value="Documentation Review and Approval Stage"
          />
          <DetailItem label="Workflow Stage" value="Review Stage" />

          <DetailItem label="Request Status" value="Under Review" />
          <DetailItem label="Customer Type" value="Nigerian (Citizen)" />
        </div>
      </div>

      {/* BTA Transaction Details */}
      <div className="space-y-6">
        <Text fw={600} c="orange" mb={"lg"} className="font-medium! text-lg!">
          BTA Transaction Details
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DetailItem label="Transaction Value (FX)" value="$4,000" />
          <DetailItem label="Transaction Value (₦)" value="₦6,000,000" />
          <DetailItem label="Requestor Type" value="Customer Direct" />
          <DetailItem label="BVN Number" value="11********674" />

          <DetailItem label="TIN Number" value="18*********373" />
          <DetailItem label="Form A ID" value="89383938393" />
          <DetailItem label="No. of Documents" value="Five (5)" />

          <DetailItem label="Pick Up State" value="Lagos State" />
          <DetailItem label="Pick Up City" value="Lagos Island" />
          <DetailItem label="Pickup Location" value="14B SBSC Office, Lagos." />
        </div>
      </div>
      <div className="space-y-6">
        {!isEmpty && (
          <EmptyState
            title="Payment Pending"
            description="So sorry, but transaction hasn’t received any payment from the customer/Transaction requestor"
            icon={EmptyImg}
          />
        )}
      </div>
    </Card>
  );
}
