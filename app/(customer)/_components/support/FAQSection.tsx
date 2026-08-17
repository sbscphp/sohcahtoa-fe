"use client";

import { useState, useMemo } from "react";
import { Accordion, TextInput } from "@mantine/core";
import { Search } from "lucide-react";
import Link from "next/link";
import { AddCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
                      <p className="text-[#6C6969] font-normal text-base leading-6 whitespace-pre-wrap">
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
