"use client";

import { SimpleGrid, Text } from "@mantine/core";
import { SupportCard } from "./_components/SupportCard";
import { FAQAccordion } from "./_components/FAQAccordion";
import { MessageCircle, History, FileText } from "lucide-react";

const TERMS_URL = "https://www.sohcahtoapayoutbdc.com/terms-of-use-agent";

export default function SupportPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <Text fw={600} size="2xl">
          Need Help? 👋
        </Text>
        <Text size="sm" c="dimmed">
          If you are feeling overwhelmed, kindly reach out and get the help you need.
        </Text>
      </div>

      {/* Action Cards */}
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        <SupportCard
          icon={<MessageCircle className="h-6 w-6 text-gray-600" />}
          title="Report an issue here"
          description="Need Help? Reach out to the support team."
          ctaText="Report Now"
          href="/agent/support/chat"
        />
        <SupportCard
          icon={<History className="h-6 w-6 text-gray-600" />}
          title="Support History"
          description="View and track the status of your past request"
          ctaText="View History"
          href="/agent/support/history"
        />
        <SupportCard
          icon={<FileText className="h-6 w-6 text-gray-600" />}
          title="Terms of Service"
          description="Want to know more about our services? Read the terms."
          ctaText="Read Terms"
          href={TERMS_URL}
          target="_blank"
          rel="noopener noreferrer"
        />
      </SimpleGrid>

      {/* FAQs Section */}
      <FAQAccordion />
    </div>
  );
}
