"use client";

import { useState, useMemo } from "react";
import { Accordion, TextInput, Text } from "@mantine/core";
import { Search } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AddCircleIcon } from "@hugeicons/core-free-icons";
import { Anchor } from "@mantine/core";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: "currencies",
    question: "What currencies do you support for exchange?",
    answer:
      "We support all major currencies including USD, CAD, and EUR and more. Our platform offers competitive exchange rates for Naira conversions with these currencies.",
  },
  {
    id: "limit",
    question: "What are the transaction limits?",
    answer:
      "Transaction limits vary by account type and verification level. You can view your current limits in the dashboard. Residents can transact up to $10,000 per transaction for sell FX.",
  },
  {
    id: "timing",
    question: "How long does a transfer take?",
    answer:
      "Most transfers are processed within 1–2 business days. IMTO (MoneyGram, Western Union) collections may be available same day depending on the partner and your location.",
  },
  {
    id: "documents",
    question: "What documents do I need to transact?",
    answer:
      "For sell FX we require a valid ID (e.g. International Passport), proof of address (utility bill), and depending on type: TIN, work permit, or visa and return ticket. Exact requirements are shown in each flow.",
  },
  {
    id: "support",
    question: "How can I contact support?",
    answer:
      "You can reach us via Chat Support from this page, or through the contact details listed in the app. We typically respond within 24 hours on business days.",
  },
];

export function FAQAccordion() {
  const [search, setSearch] = useState("");

  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return DEFAULT_FAQS;
    const q = search.toLowerCase().trim();
    return DEFAULT_FAQS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="mb-6">
        <Text fw={600} size="lg" mb="xs">
          FAQs
        </Text>
        <Text size="sm" c="dimmed">
          Everything you need to know about sohcahtoa. Can&apos;t find the
          answers you are looking for?{" "}
          <Anchor
            href="/agent/support/chat"
            className="text-primary-400 underline font-medium"
          >
            Chat Support
          </Anchor>
        </Text>
      </div>

      <div className="space-y-4">
        <TextInput
          placeholder="Search Question"
          leftSection={<Search size={16} className="text-gray-400" />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          radius="xl"
        />

        <Accordion
          chevron={<HugeiconsIcon icon={AddCircleIcon} size={20} />}
          className="w-full"
        >
          {filteredFaqs.length === 0 ? (
            <Text size="sm" c="dimmed" py="md">
              No matching questions. Try a different search.
            </Text>
          ) : (
            filteredFaqs.map((faq) => (
              <Accordion.Item key={faq.id} value={faq.id}>
                <Accordion.Control>
                  <Text fw={500} size="sm">
                    {faq.question}
                  </Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text size="sm" c="dimmed">
                    {faq.answer}
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>
            ))
          )}
        </Accordion>
      </div>
    </div>
  );
}
