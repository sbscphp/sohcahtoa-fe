"use client";

import { landingFig } from "@/app/assets/asset";
import OptionCard from "@/app/(customer)/_components/OptionCard";
import { BanknoteIcon, Calculator, Wallet } from "lucide-react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calculator01Icon,
  MessageMultiple01Icon,
  TransactionHistoryIcon
} from "@hugeicons/core-free-icons";

const iconClass = "h-6 w-6 text-[#8F8B8B]";

export default function LandingSupport() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Icon */}
        <div className="w-24 h-24 border-10 border-primary-400 rounded-lg flex items-center justify-center">
          <Image src={landingFig} alt="landing figure" />
        </div>

        {/* Greeting */}
        <div className="space-y-2">
          <h1 className="text-body-heading-300 text-2xl font-semibold">
            Hi, There 👋
          </h1>
          <p className="text-body-text-200 text-lg max-w-sm">
            If you are feeling overwhelmed, kindly reach out and get the help
            you need.
          </p>
        </div>
      </div>

      {/* Empty State Action Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <OptionCard
          icon={<HugeiconsIcon icon={MessageMultiple01Icon} />}
          title="Chat Support"
          description="Need Help? Reach out to the support team."
          ctaText="Chat Now"
          href="/support/chat"
        />
        <OptionCard
          icon={<HugeiconsIcon icon={TransactionHistoryIcon} />}
          title="Support History"
          description="View and track the status of your past request."
          ctaText="View History"
          href="/support/history"
        />
        <OptionCard
          icon={<HugeiconsIcon icon={Calculator01Icon} />}
          title="Terms of Service"
          description="Want to know more about our services? Read the terms."
          ctaText="Read Terms"
        />
      </div>
    </div>
  );
}
