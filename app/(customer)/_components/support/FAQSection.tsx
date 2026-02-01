"use client";

import { useState, useMemo } from "react";
import { Accordion, TextInput } from "@mantine/core";
import { Search, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { AddCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
      "We support all major currencies including USD, CAD, and EUR and more. Our platform offers competitive exchange rates for Naira conversions with these currencies."
  },
  {
    id: "limit",
    question: "What are the transaction limits?",
    answer:
      "Transaction limits vary by account type and verification level. You can view your current limits in the dashboard. Residents can transact up to $10,000 per transaction for sell FX."
  },
  {
    id: "timing",
    question: "How long does a transfer take?",
    answer:
      "Most transfers are processed within 1–2 business days. IMTO (MoneyGram, Western Union) collections may be available same day depending on the partner and your location."
  },
  {
    id: "documents",
    question: "What documents do I need to transact?",
    answer:
      "For sell FX we require a valid ID (e.g. International Passport), proof of address (utility bill), and depending on type: TIN, work permit, or visa and return ticket. Exact requirements are shown in each flow."
  },
  {
    id: "support",
    question: "How can I contact support?",
    answer:
      "You can reach us via Chat Support from this page, or through the contact details listed in the app. We typically respond within 24 hours on business days."
  }
];

export default function FAQSection() {
  const [search, setSearch] = useState("");

  const filteredFaqs = useMemo(
    () => {
      if (!search.trim()) return DEFAULT_FAQS;
      const q = search.toLowerCase().trim();
      return DEFAULT_FAQS.filter(
        faq =>
          faq.question.toLowerCase().includes(q) ||
          faq.answer.toLowerCase().includes(q)
      );
    },
    [search]
  );

  return (
    <div className="flex flex-row flex-wrap lg:flex-nowrap items-start gap-6 p-6 w-full bg-white border-[1.5px] border-text-50 rounded-[16px]">
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 lg:gap-12 w-full">
        <div className="flex flex-col items-start gap-3 w-full">
          <h2 className="text-[#323131] font-semibold text-xl leading-7 w-full">
            FAQs
          </h2>
          <p className="text-[#6C6969] font-normal text-base leading-6 w-full">
            Everything you need to know about sohcahtoa. Can&apos;t find the
            answers you are looking for?{" "}
            <Link
              href="/support/chat"
              className="text-primary-400 underline hover:text-primary-500 font-medium"
            >
              Chat Support
            </Link>
          </p>
        </div>

        {/* Right: search + accordion — Frame 2147225019 */}
        <div className="w-full space-y-4">
          <TextInput
            placeholder="Search Question"
            leftSection={<Search size={14} className="text-[#B2AFAF]" />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full"
            radius="xl"
          />
          <Accordion
            chevron={<HugeiconsIcon icon={AddCircleIcon} />}
            className="w-full"
          >
            {filteredFaqs.length === 0
              ? <p className="text-[#6C6969] text-sm py-4">
                  No matching questions. Try a different search.
                </p>
              : filteredFaqs.map(faq =>
                  <Accordion.Item key={faq.id} value={faq.id}>
                    <Accordion.Control className="">
                      <span className="text-[#4D4B4B] font-semibold text-lg leading-[26px] flex-1 text-left">
                        {faq.question}
                      </span>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <p
                        className="text-[#6C6969] font-normal text-base leading-6"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {faq.answer}
                      </p>
                    </Accordion.Panel>
                  </Accordion.Item>
                )}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
