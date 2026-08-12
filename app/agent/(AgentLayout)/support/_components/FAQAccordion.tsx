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

/** Synced from https://sohcahtoa-landingpage.vercel.app/#faq */
const DEFAULT_FAQS: FAQItem[] = [
  {
    id: "currencies",
    question: "What currencies do you exchange?",
    answer:
      "We buy, sell and pay-out major foreign currencies, including USD, GBP, EUR, and more.",
  },
  {
    id: "rates",
    question: "How can I check your exchange rates?",
    answer:
      "Our rates are updated daily and available through our rate calculator on the website and app. Rates may vary slightly depending on market conditions.",
  },
  {
    id: "signup",
    question: "What do I need to signup?",
    answer:
      "All customers are required to provide:\n• BVN (Bank Verification Number)\n• NIN (National Identification Number)\n• International Passport\n\nThese documents are mandatory for all transactions to comply with CBN regulations.",
  },
  {
    id: "fees",
    question: "Is there a transaction fee?",
    answer:
      "Some transactions may include a small service fee. We always inform you of any charges before completing your transaction.",
  },
  {
    id: "large-amounts",
    question: "Can I exchange large amounts of money?",
    answer:
      "Yes, but large transactions (usually above USD 10,000 or equivalent) require additional verification and documentation for compliance with regulatory requirements.",
  },
  {
    id: "timing",
    question: "How long will my transaction take?",
    answer:
      "Within 24 hours. Larger transactions may take longer due to verification procedures.",
  },
  {
    id: "reserve",
    question: "Can I reserve foreign currency in advance?",
    answer:
      "Yes, you can reserve foreign currency ahead of time subject to availability and regulatory requirements.",
  },
  {
    id: "sell-back",
    question: "Can I sell foreign currency back to your BDC?",
    answer:
      "Yes. We buy major foreign currencies from customers at competitive market rates.",
  },
  {
    id: "get-started",
    question: "How do I get started?",
    answer:
      "Simply create an account, complete verification, and you can begin exchanging currencies through our platform.",
  },
  {
    id: "counterfeit",
    question: "What happens if I receive counterfeit notes?",
    answer:
      "We carefully verify all notes during transactions. If a counterfeit note is detected, it is reported to the authorities. Always count and check your cash when exchanging.",
  },
  {
    id: "limits",
    question: "Are there limits on how much I can exchange?",
    answer:
      "Yes, based on regulations.\n\nBTA - $5,000 per 3 months\n\nPTA - $4,000 per 3 months\n\nMedical fees - $5,000 per 3 months\n\nSchool fees - $10,000 per year\n\nProfessional Exam fee - $2,000",
  },
  {
    id: "businesses",
    question: "Can businesses buy and sell FX with you?",
    answer: "Approved businesses can sell FX to us but cannot buy from us.",
  },
  {
    id: "receipt",
    question: "Do I get a receipt for every transaction?",
    answer:
      "Yes, every transaction is accompanied by an official receipt for your records.",
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
                  <Text size="sm" c="dimmed" className="whitespace-pre-wrap">
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
