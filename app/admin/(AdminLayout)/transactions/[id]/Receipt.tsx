"use client";

import EmptyState from "@/app/admin/_components/EmptyState";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DetailItem } from "../_transactionsComponents/DetailItem";
import { Card, Group, Text, Title, Button } from "@mantine/core";
import Empty from "../../../_components/assets/EmptyTrans.png";
import Image from "next/image";
import { ArrowUpRight, File } from "lucide-react";

export default function Receipt({ isEmpty }: { isEmpty?: boolean }) {
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

        <Button color="#DD4F05" radius="xl" size="lg">
          Take Action
        </Button>
      </Group>
      {isEmpty && (
        <div>
          <div className="space-y-6">
            <Text fw={600} c="orange" mb="lg" className="font-medium! text-lg!">
              Receipt Details
            </Text>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <DetailItem label="Total payable" value="₦2,500,000.00" />
              <DetailItem label="Receipt Transaction ID" value="u8336734HHAAA" />
              <DetailItem label="Date" value="Nov 19 2025" />
              <DetailItem label="Time" value="1:00 pm" />
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
                    Receipt of Payment
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
            title="Payment Pending"
            description="So sorry, but transaction hasn’t received any payment from the customer/Transaction requestor"
            icon={EmptyImg}
          />
        )}
      </div>
    </Card>
  );
}
