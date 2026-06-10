"use client";



import { Card, Group, Text, Select } from "@mantine/core";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { Transaction } from "../../../_types/dashboard";

import { ArrowUpRight, ListFilter } from "lucide-react";
import { TRANSACTION_TYPE_FILTER_OPTIONS } from "../mapDashboardData";

import DynamicTableSection from "../../../_components/DynamicTableSection";

import { adminRoutes } from "@/lib/adminRoutes";

import { toSentenceCase } from "@/app/utils/helper/toSentence";


export function RecentTransactionsTable({

  data,

  loading = false,

  txnType,

  onTxnTypeChange,

}: {

  data: Transaction[];

  loading?: boolean;

  txnType: string;

  onTxnTypeChange: (value: string) => void;

}) {

  const router = useRouter();



  return (

    <Card withBorder radius="md" padding="md">

      <Group justify="space-between" mb="md">

        <Text fw={500} size="lg">

          Transaction History

        </Text>

        <Group gap="sm">

        <Select
          value={txnType}
          onChange={(value) => onTxnTypeChange(value ?? "")}
          data={TRANSACTION_TYPE_FILTER_OPTIONS}
          clearable
          radius="xl"
          w={180}
          rightSection={<ListFilter size={16} />}
        />

        <Link

          href={adminRoutes.adminTransactions()}

          className="flex items-center gap-1 cursor-pointer no-underline"

        >

          <Text size="sm" c="orange">

            View all

          </Text>

          <ArrowUpRight size={14} color="orange" />

        </Link>

        </Group>

      </Group>



      <DynamicTableSection

        headers={[
          { label: "Customer Name", key: "customer" },

          { label: "Transaction ID", key: "reference" },
          

          { label: "Transaction Type", key: "type" },


          { label: "Transaction Date", key: "date" },

        ]}

        data={data}

        loading={loading}

        onRowClick={(transaction) =>

          router.push(adminRoutes.adminTransactionDetails(transaction.id))

        }

        renderItems={(transaction: Transaction) => {

          const displayId = transaction.referenceNumber ?? transaction.id;

          return [

            <div key="customer">

              <Text size="sm" fw={500}>

                {transaction.customerName}

              </Text>


            </div>,

            <Text key="reference" size="sm">
              {displayId}
            </Text>,

            <Text key="type" size="sm">
              {toSentenceCase(transaction.transactionType)}
            </Text>,

            <div key="date">

              <Text size="sm" fw={500}>

                {transaction.date}

              </Text>

              <Text size="xs" c="dimmed">

                {transaction.time}

              </Text>

            </div>,

          ];

        }}

        emptyMessage="No transactions found"

        emptyTitle="No Transactions"

      />

    </Card>

  );

}


