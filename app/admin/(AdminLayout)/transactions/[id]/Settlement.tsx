"use client";

import EmptyState from "@/app/admin/_components/EmptyState";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DetailItem } from "../../../_components/DetailItem";
import { Card, Group, Text, Title } from "@mantine/core";
import TakeActionButton from "@/app/admin/_components/TakeActionButton";
import Empty from "../../../_components/assets/EmptyTrans.png";
import Image from "next/image";
import { ArrowUpRight, File } from "lucide-react";

export default function Settlement({ isEmpty }: { isEmpty?: boolean }) {
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
            <StatusBadge status="Pending" size="sm" />
          </Group>
        </div>

        <TakeActionButton />
      </Group>

      {isEmpty && (
        <div>
          <div className="space-y-6">
            <Text fw={600} c="orange" mb="lg" className="font-medium! text-lg!">
              Settlement Details
            </Text>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <DetailItem label="Settlement ID" value="GHAH7844" />
              <DetailItem label="Settled By" value="Fatia Sikiru (ID: 9033)" />
              <DetailItem label="Settlement Date" value="Nov 19 2025" />
              <DetailItem label="Settlement Time" value="2:00 pm" />

              <DetailItem label="Total Settlement (FX)" value="$150" />
              <DetailItem label="Total Settlement (₦)" value="₦1,4500,000" />
              <DetailItem
                label="Settlement Structure (Cash Pickup)"
                value="100% ~ $1,000"
              />
              <div className="space-y-1">
                <Text size="xs" className="text-body-text-50!" mb={4}>
                  Settlement Status
                </Text>
                <StatusBadge status="Completed" size="sm" />
              </div>
            </div>
          </div>

          <div className="space-y-6 mt-10 mb-5 max-w-[70%]">
            <Text fw={600} c="orange" mb="lg" className="font-medium! text-lg!">
              Payment Receipt
            </Text>
            <div className="flex gap-2 mb-2 p-2 border border-gray-300 rounded-md cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#FFF6F1] border-4 border-[#FFFAF8] rounded-3xl ">
                  <File size={16} color="#DD4F05" />
                </div>
                <div>
                  <Text fw={500} className="text-body-heading-300">
                    Settlement Receipt
                  </Text>
                  <Text size="xs" className="text-body-text-50!">
                    200 KB
                  </Text>
                </div>
              </div>
              <ArrowUpRight
                size={16}
                color="#DD4F05"
                className="mt-2 ml-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* BTA Transaction Details */}
      <div className="space-y-6 mb-6">
        {!isEmpty && (
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
