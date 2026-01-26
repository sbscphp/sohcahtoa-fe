"use client";

import EmptyState from "@/app/admin/_components/EmptyState";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { Card, Group, Text, Title, Button } from "@mantine/core";
import Empty from "../../../_components/assets/EmptyTrans.png";
import Image from "next/image";
import { ArrowUpRight, File } from "lucide-react";

interface DetailItemProps {
  label: string;
  value: string;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="space-y-1">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={500}>{value}</Text>
    </div>
  );
}

export default function Receipt({ isEmpty }: { isEmpty?: boolean }) {
  const EmptyImg = <Image src={Empty} alt="No Details Available" />;
  return (
    <Card radius="lg" p="xl" className="m-5 bg-[#F7F7F7]">
      {/* Header */}
      <Group justify="space-between" align="flex-start" mb="xl">
        <div>
          <Title order={4}>
            <span className="font-medium text-[#8F8B8B] ">Buy FX:</span>{" "}
            Business Travel Allowance
          </Title>

          <Group gap="xs" mt={4}>
            <Text size="xs" c="dimmed">
              Nov 17 2025 | 11:00am
            </Text>
            <StatusBadge status="Pending" size="xs" />
          </Group>
        </div>

        <Button color="#DD4F05" radius="xl">
          Take Action
        </Button>
      </Group>
      {isEmpty && (
        <div>
          <div className=" flex justify-between">
            <div>
              <p className="text-base text-[#8F8B8B]">Total payable</p>
              <h2 className="text-base font-medium">₦2,500,000.00</h2>
            </div>
            <div>
              <p className="text-base text-[#8F8B8B]">Receipt Transaction ID</p>
              <h2 className="text-base font-medium">u8336734HHAAA</h2>
            </div>
            <div>
              <p className="text-base text-[#8F8B8B]">Date</p>
              <h2 className="text-base font-medium">Nov 19 2025</h2>
            </div>
            <div>
              <p className="text-base text-[#8F8B8B]">Time</p>
              <h2 className="text-base font-medium">1:00 pm</h2>
            </div>
          </div>

          <div className="mt-10 mb-5 max-w-[70%]">
            <p className="text-base text-[#8F8B8B] mb-2">Payment Receipt</p>
            <div className="flex gap-2 mb-2 p-2 border border-gray-300 rounded-md cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#FFF6F1] border-4 border-[#FFFAF8] rounded-3xl ">
                  <File size={16} color="#DD4F05" />
                </div>
                <div>
                  <h2 className="font-medium text-[#4D4B4B]">
                    Receipt of Payment
                  </h2>
                  <p className="text-base text-[#8F8B8B]">200 KB</p>
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
      <div className="space-y-6 mb-">
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
