"use client";

import { Avatar, Button, Divider, Group, Stack, Text } from "@mantine/core";
import { Download } from "lucide-react";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DetailItem } from "@/app/admin/_components/DetailItem";

export default function AgentTransactionsPage() {
    // NOTE: This is mock data to mirror the design.
    // When wiring to real data, replace these with fetched values.
    const transactionTitle = "Personal Travel Allowance (PTA)";
    const transactionDate = "Nov 17 2025";
    const transactionTime = "1:00pm";

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white shadow-sm">
                {/* Header */}
                <div className="flex flex-col p-6 md:p-8 gap-4 md:flex-row md:items-start md:justify-between">
                    <Stack gap={6} className="flex-1">
                        <div className="space-y-2">
                            <Text size="xl" fw={600}>
                                {transactionTitle}
                            </Text>

                            <Group gap={8} className="flex-wrap text-sm text-[#6B7280]">
                                <span>
                                    {transactionDate} | {transactionTime}
                                </span>
                                <StatusBadge status="Transaction Settled" />
                            </Group>

                            <div className="inline-flex items-center gap-3 rounded-full border border-gray-100 bg-white px-3 py-1">
                                <div className="flex -space-x-2">
                                    <Avatar
                                        radius="xl"
                                        size={24}
                                        color="gray"
                                        className="ring-2 ring-white"
                                    >
                                        US
                                    </Avatar>
                                    <Avatar
                                        radius="xl"
                                        size={24}
                                        color="green"
                                        className="-ml-2 ring-2 ring-white"
                                    >
                                        NG
                                    </Avatar>
                                </div>

                                <Text size="sm" fw={500} className="text-body-heading-300">
                                    Currency Transacted
                                </Text>
                            </div>
                        </div>
                    </Stack>

                    <Button
                        radius="xl"
                        size="md"
                        color="#DD4F05"
                        variant="outline"
                        rightSection={<Download size={18} />}
                        className="self-start md:self-auto"
                    >
                        Download Receipt
                    </Button>
                </div>

                <Divider className="my-6" />


                <div className="p-6 md:p-8">
                    {/* Agent Details */}
                    <section className="space-y-4 mb-10">
                        <Text fw={600} className="text-primary-400! mb-5!">
                            Agent Details
                        </Text>
                        <div className="grid gap-6 md:grid-cols-4">
                            <DetailItem label="Agent ID" value="2223334355" />
                            <DetailItem label="Agent Name" value="Babangida Idris" />
                            <DetailItem label="Email Address" value="$ 400" />
                            <DetailItem label="Phone Number" value="+234 8138898206" />
                        </div>
                    </section>

                    {/* Transaction Details */}
                    <section className="space-y-4 mb-10">
                        <Text fw={600} className="text-primary-400! mb-4!">
                            Transaction Details
                        </Text>
                        <div className="grid gap-6 md:grid-cols-4">
                            <DetailItem label="Transaction ID" value="2223334355" />
                            <DetailItem label="Amount" value="NGN 400,000.00" />
                            <DetailItem label="Equivalent Amount" value="$ 400" />
                            <DetailItem label="Date initiated" value="25 Jun 2025" />
                            <DetailItem
                                label="Pickup Address"
                                value="3, Adeola Odeku, VI, Lagos"
                            />
                        </div>
                    </section>


                    {/* Required Documents */}
                    <section className="space-y-4 mb-10">
                        <Text fw={600} className="text-primary-400! mb-5!">
                            Required Documents
                        </Text>
                        <div className="grid gap-6 md:grid-cols-4">
                            <DetailItem label="BVN" value="2223334355" />
                            <DetailItem label="TIN" value="876245623" />
                            <DetailItem label="Form A ID" value="23456786543" />
                            <DetailItem label="Form A" value="Doc.pdf" />
                            <DetailItem label="Utility Bill" value="Doc.pdf" />
                            <DetailItem label="Visa" value="Doc.pdf" />
                            <DetailItem label="Return Ticket" value="Doc.pdf" />
                        </div>
                    </section>


                    {/* Payment Details */}
                    <section className="space-y-4 mb-10">
                        <Text fw={600} className="text-primary-400! mb-5!">
                            Payment Details
                        </Text>
                        <div className="grid gap-6 md:grid-cols-4">
                            <DetailItem label="Transaction ID" value="783383AXSH" />
                            <DetailItem label="Transaction Date" value="15 Nov 2025" />
                            <DetailItem label="Transaction Time" value="11:00 am" />
                            <DetailItem label="Transaction Receipt" value="payment-receipt.pdf" />
                            <DetailItem label="Paid to" value="SohCahToa BSC" />
                            <DetailItem label="Bank Name" value="Access Bank 0069000592" />
                        </div>
                    </section>

                    {/* Transaction Settlement */}
                    <section className="space-y-4">
                        <Text fw={600} className="text-primary-400! mb-5!">
                            Transaction Settlement
                        </Text>
                        <div className="grid gap-6 md:grid-cols-4">
                            <DetailItem label="Settlement ID" value="278338233AC" />
                            <DetailItem label="Settlement Date" value="17 Nov 2025" />
                            <DetailItem label="Settlement Time" value="1:00 pm" />
                            <DetailItem
                                label="Settlement Receipt"
                                value="settlement-receipt.pdf"
                            />
                            <DetailItem label="Settlement Structure (Cash)" value="25% ~ $375" />
                            <DetailItem
                                label="Settlement Structure (Prepaid Card)"
                                value="75% ~ $1,125"
                            />
                            <DetailItem label="75% Paid Into" value="GTB Bank Card 11 ******** 6773" />
                            <div className="space-y-1">
                                <Text size="xs" className="text-body-text-50!" mb={4}>
                                    Settlement Status
                                </Text>
                                <StatusBadge status="Completed" />
                            </div>
                        </div>
                    </section>

                </div>

            </div>
        </div>
    );
}