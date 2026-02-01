"use client";
import { Tabs } from "@mantine/core";
import Overview from "./Overview";
import Receipt from "./Receipt";
import Settlement from "./Settlement";
import AdminTabButton from "@/app/admin/_components/AdminTabButton";

export default function ViewTransactionPage () {
  return (
    <div>
        <h2 className="font-semibold text-heading-300">View Transaction</h2>
        <Tabs color="orange" defaultValue="overview" className="mt-3!">
        <Tabs.List className="mb-3 border-0! before:content-none!">
          <AdminTabButton value="overview">Overview</AdminTabButton>
          <AdminTabButton value="receipt">Receipt of Payment</AdminTabButton>
          <AdminTabButton value="transaction-settlement">Transaction Settlement</AdminTabButton>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <Overview />
        </Tabs.Panel>

        <Tabs.Panel value="receipt"><Receipt /></Tabs.Panel>

        <Tabs.Panel value="transaction-settlement"><Settlement /></Tabs.Panel>
      </Tabs>
    </div>
  )
};

