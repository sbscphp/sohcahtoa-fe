"use client";

import { useState } from "react";
import { Card, Text, Group, Stack, Anchor, Badge, Divider } from "@mantine/core";
import { useRouter, useParams } from "next/navigation";
import { DetailItem } from "@/app/admin/_components/DetailItem";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { ArrowUpRight, Edit } from "lucide-react";
import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import { agentApi } from "@/app/agent/_services/agent-api";
import type { AgentCustomerDetailsResponse } from "@/app/_lib/api/types";
import {
  formatHeaderDateTime,
  formatShortDate,
} from "@/app/utils/helper/formatLocalDate";
import { TransactionHistoryModal } from "../_components/TransactionHistoryModal";
import DocumentViewerModal from "@/app/agent/_components/modal/DocumentViewerModal";

export default function ViewCustomerDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [transactionHistoryOpened, setTransactionHistoryOpened] = useState(false);
  const [documentViewer, setDocumentViewer] = useState<{
    url: string;
    filename: string;
  } | null>(null);
  const customerId = params?.id ?? "";
  const { data, isLoading } = useFetchSingleData<AgentCustomerDetailsResponse>(
    customerId ? [...agentKeys.customers.detail(customerId)] : [],
    () => agentApi.customers.getById(customerId),
    !!customerId
  );
  const customer = data?.data;

  const documents = [
    { label: "Form A", key: "FormA" },
    { label: "Utility Bill", key: "utilityBill" },
    { label: "Visa", key: "Visa" },
    { label: "Return Ticket", key: "ReturnTicket" },
  ] as const;

  const registeredLabel = customer?.registeredAt
    ? formatHeaderDateTime(customer.registeredAt)
    : "—";
  const status = customer?.totalTransactionsCompleted
    ? "Repeat Customer"
    : "New Customer";

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
              Registered: {registeredLabel}
            </Text>
          </div>

          <Group gap="xs">
            {/* <CustomButton
              buttonType="secondary"
              leftSection={<Edit size={16} />}
              onClick={() => {
                // Handle edit
                console.log("Edit customer");
              }}
            >
              Edit
            </CustomButton> */}
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
            <DetailItem
              label="Full Name"
              value={customer?.fullName ?? "—"}
              loading={isLoading}
            />
            <DetailItem
              label="Email Address"
              value={customer?.email ?? "—"}
              loading={isLoading}
            />
            <DetailItem label="Phone Number" value="—" loading={isLoading} />
            <DetailItem
              label="Date Onboarded"
              value={
                customer?.dateOnboarded
                  ? formatShortDate(customer.dateOnboarded)
                  : "—"
              }
              loading={isLoading}
            />
            <DetailItem
              label="Transactions Completed"
              value={String(customer?.totalTransactionsCompleted ?? 0)}
              loading={isLoading}
            />
            <div className="space-y-1">
              <Text size="xs" className="text-body-text-50!" mb={4}>
                Status
              </Text>
              <Badge color="orange" variant="light" size="sm">
                {status}
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
            <DetailItem
              label="Customer ID"
              value={customer?.userId ?? customerId}
              loading={isLoading}
            />
            <DetailItem
              label="ID Type"
              value={customer?.idDetails.idType ?? "—"}
              loading={isLoading}
            />
            <DetailItem
              label="BVN"
              value={customer?.idDetails.bvn ?? "—"}
              loading={isLoading}
            />
            <DetailItem
              label="TIN"
              value={customer?.idDetails.tin ?? "—"}
              loading={isLoading}
            />
            <DetailItem
              label="Form A ID"
              value={customer?.idDetails.formAId ?? "—"}
              loading={isLoading}
            />
            {documents.map((doc) => {
              const file = customer?.files?.[doc.key];

              return (
                <div key={doc.key} className="space-y-1">
                  <Text size="xs" className="text-body-text-50!" mb={4}>
                    {doc.label}
                  </Text>
                  <Group gap="xs">
                    <Text fw={500} size="sm">
                      {isLoading ? "Loading..." : file?.fileName ?? "Not uploaded"}
                    </Text>
                    {file?.fileUrl ? (
                      <Anchor
                        href="#"
                        size="sm"
                        className="text-primary-400 flex items-center gap-1"
                        onClick={(event) => {
                          event.preventDefault();
                          setDocumentViewer({
                            url: file.fileUrl,
                            filename: file.fileName,
                          });
                        }}
                      >
                        View
                      </Anchor>
                    ) : null}
                  </Group>
                </div>
              );
            })}
          </div>
        </Stack>
      </Card>

      <TransactionHistoryModal
        opened={transactionHistoryOpened}
        onClose={() => setTransactionHistoryOpened(false)}
        customerId={customerId}
      />
      <DocumentViewerModal
        opened={documentViewer !== null}
        onClose={() => setDocumentViewer(null)}
        fileUrl={documentViewer?.url ?? null}
        filename={documentViewer?.filename}
      />
    </div>
  );
}
