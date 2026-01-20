"use client";

import { landingFig } from "@/app/assets/asset";
import OptionCard from "@/app/(customer)/_components/OptionCard";
import { BanknoteIcon, Calculator, Wallet } from "lucide-react";
import Image from "next/image";

const iconClass = "h-6 w-6 text-[#8F8B8B]";

export default function DashboardPage() {
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
            Welcome to Sohcahtoa, choose the transaction you would like to do
            first.
          </p>
        </div>
      </div>

      {/* Empty State Action Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <OptionCard
          icon={<Calculator className={iconClass} size={24} />}
          title="Buy Fx"
          description="Need travel, medical or study funds? Buy your FX directly in a few simple steps."
          ctaText="Buy Now"
        />
        <OptionCard
          icon={<BanknoteIcon className={iconClass} size={24} />}
          title="Sell Fx"
          description="Got foreign currency? Sell it and get paid in Naira with ease."
          ctaText="Sell Now"
        />
        <OptionCard
          icon={<Wallet className={iconClass} size={24} />}
          title="Receive Money"
          description="Expecting money from overseas? Receive it easily through our approved IMTO partners."
          ctaText="Get Started"
        />
      </div>
    </div>
  );
}
