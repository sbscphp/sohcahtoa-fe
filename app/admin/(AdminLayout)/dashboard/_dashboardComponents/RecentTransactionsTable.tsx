"use client";



import { Card, Group, Text } from "@mantine/core";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { Transaction } from "../../../_types/dashboard";

import { ArrowUpRight } from "lucide-react";

import DynamicTableSection from "../../../_components/DynamicTableSection";

import { adminRoutes } from "@/lib/adminRoutes";

import { toSentenceCase } from "@/app/utils/helper/toSentence";


export function RecentTransactionsTable({

  data,

  loading = false,

}: {

  data: Transaction[];

  loading?: boolean;

}) {

  const router = useRouter();



  return (

    <Card withBorder radius="md" padding="md">

      <Group justify="space-between" mb="md">

        <Text fw={500} size="lg">

          Transaction History

        </Text>

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


