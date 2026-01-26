"use client";
import { Tabs } from "@mantine/core";
import Overview from "./Overview";
import Receipt from "./Receipt";
import Settlement from "./Settlement";

export default function ViewTransactionPage () {
  return (
    <div>
        <h2 className="font-semibold text-lg">View Transaction</h2>
        <Tabs color="orange" defaultValue="overview">
        <Tabs.List className="mb-3">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="receipt">Receipt of Payment</Tabs.Tab>
          <Tabs.Tab value="transaction-settlement">Transaction Settlement</Tabs.Tab>
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

