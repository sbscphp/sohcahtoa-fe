"use client";

import { useState } from "react";
import { Card, Text, Group, Stack, Anchor, Badge, Divider } from "@mantine/core";
import { useRouter, useParams } from "next/navigation";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { ArrowUpRight, Download, Edit } from "lucide-react";
import { TransactionHistoryModal } from "../_components/TransactionHistoryModal";

export default function ViewCustomerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [transactionHistoryOpened, setTransactionHistoryOpened] = useState(false);

  // Mock customer data - replace with actual API call
  const customer = {
    fullName: "Fiyinfoluwa Familua",
    email: "fiyinfoluwa@sohcatoa.com",
    phone: "+234 90 4747 2791",
    dateOnboarded: "3 Jun 2025",
    transactionsCompleted: 12,
    status: "Pending",
    idType: "Resident",
    bvn: "2223334355",
    tin: "876r245623",
    formAId: "23456786543",
    registeredDate: "24 Jan 2025",
    registeredTime: "11:00am",
  };

  const documents = [
    { name: "Form A", file: "Doc.pdf" },
    { name: "Utility Bill", file: "Doc.pdf" },
    { name: "Visa", file: "Doc.pdf" },
    { name: "Return Ticket", file: "Doc.pdf" },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Group gap="xs">
        <Anchor
          href="/agent/customer-management"
          size="sm"
          c="dimmed"
          onClick={(e) => {
            e.preventDefault();
            router.push("/agent/customer-management");
          }}
        >
          Customer Management
        </Anchor>
        <Text size="sm" c="dimmed">
          /
        </Text>
        <Text size="sm" fw={500}>
          View Customer Details
        </Text>
      </Group>

      {/* Customer Details Overview Card */}
      <Card radius="md" padding="lg" withBorder>
        <Group justify="space-between" mb="md">
          <div>
            <Text fw={600} size="xl" mb="xs">
              Customer Details Overview
            </Text>
            <Text size="sm" c="dimmed">
              Registered: {customer.registeredDate} | {customer.registeredTime}
            </Text>
          </div>

          <Group gap="xs">
            <CustomButton
              buttonType="secondary"
              leftSection={<Edit size={16} />}
              onClick={() => {
                // Handle edit
                console.log("Edit customer");
              }}
            >
              Edit
            </CustomButton>
            <CustomButton
              buttonType="primary"
              rightSection={<ArrowUpRight size={16} />}
              onClick={() => setTransactionHistoryOpened(true)}
            >
              View Transaction History
            </CustomButton>
          </Group>
        </Group>

        <Divider my="md" />

        {/* Personal Details Section */}
        <Stack gap="md" mb="lg">
          <Text fw={600} size="sm" c="orange">
            Personal Details
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailItem label="Full Name" value={customer.fullName} />
            <DetailItem label="Email Address" value={customer.email} />
            <DetailItem label="Phone Number" value={customer.phone} />
            <DetailItem label="Date Onboarded" value={customer.dateOnboarded} />
            <DetailItem
              label="Transactions Completed"
              value={customer.transactionsCompleted.toString()}
            />
            <div className="space-y-1">
              <Text size="xs" className="text-body-text-50!" mb={4}>
                Status
              </Text>
              <Badge color="orange" variant="light" size="sm">
                {customer.status}
              </Badge>
            </div>
          </div>
        </Stack>

        <Divider my="md" />

        {/* ID Details Section */}
        <Stack gap="md">
          <Text fw={600} size="sm" c="orange">
            ID Details
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailItem label="ID Type" value={customer.idType} />
            <DetailItem label="BVN" value={customer.bvn} />
            <DetailItem label="TIN" value={customer.tin} />
            <DetailItem label="Form A ID" value={customer.formAId} />
            {documents.map((doc) => (
              <div key={doc.name} className="space-y-1">
                <Text size="xs" className="text-body-text-50!" mb={4}>
                  {doc.name}
                </Text>
                <Group gap="xs">
                  <Text fw={500} size="sm">
                    {doc.file}
                  </Text>
                  <Anchor
                    href="#"
                    size="sm"
                    className="text-primary-400 flex items-center gap-1"
                  >
                    <Download size={14} />
                    Download
                  </Anchor>
                </Group>
              </div>
            ))}
          </div>
        </Stack>
      </Card>

      <TransactionHistoryModal
        opened={transactionHistoryOpened}
        onClose={() => setTransactionHistoryOpened(false)}
        customerId={params.id as string}
      />
    </div>
  );
}
