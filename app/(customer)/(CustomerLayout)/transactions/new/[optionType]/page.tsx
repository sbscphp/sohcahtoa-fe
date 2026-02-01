"use client";

import { useParams } from "next/navigation";
import FxTransactionTypeCard from "@/app/(customer)/_components/FxTransactionTypeCard";
import {
  User,
  Building2,
  GraduationCap,
  Hospital,
  Users,
  Globe,
  Wallet,
} from "lucide-react";

const FX_OPTIONS_BUY = [
  {
    icon: User,
    title: "I am going on a Vacation",
    description: "Buy FX to cover your travel, accommodation",
    href: "/transactions/vacation",
  },
  {
    icon: Building2,
    title: "I am travelling for business",
    description: "Buy FX to cover for your business trip abroad",
    href: "/transactions/business",
  },
  {
    icon: GraduationCap,
    title: "Pay School Fees",
    description: "Pay tuition for undergraduate & postgraduate studies.",
    href: "/transactions/school-fees",
  },
  {
    icon: Hospital,
    title: "Seek Medical Treatment",
    description: "Pay for medical treatment or hospital bills abroad",
    href: "/transactions/medical",
  },
  {
    icon: Users,
    title: "Pay a Professional Body",
    description: "E.g International membership fee",
    href: "/transactions/professional-body",
  },
  {
    icon: Globe,
    title: "I am Touring Nigeria",
    description: "Buy FX to cover your travel, accommodation",
    href: "/transactions/tourist",
  },
] as const;

const FX_OPTIONS_SELL = [
  {
    icon: User,
    title: "Resident",
    description: "Begin a new transaction for fx needs",
    href: "/transactions/sell/resident",
  },
  {
    icon: Building2,
    title: "I am Touring Nigeria",
    description: "Sell FX from your visit to Nigeria",
    href: "/transactions/sell/touring-nigeria",
  },
  {
    icon: GraduationCap,
    title: "Expatriate; I am a foreigner who works in Nigeria",
    description: "Sell FX to manage your living expenses easily",
    href: "/transactions/sell/expatriate",
  },
] as const;

const OPTION_CONFIG = {
  buy: {
    heading: "What would you like to use the FX for?",
    subheading: "Select transaction type below",
    options: FX_OPTIONS_BUY,
  },
  sell: {
    heading: "How would you like to sell your FX?",
    subheading: "Select seller type below",
    options: FX_OPTIONS_SELL,
  },
  receive: {
    heading: "Receive money from overseas",
    subheading: "Select your preferred option",
    options: [
      {
        icon: Wallet,
        title: "IMTO (MoneyGram / Western Union)",
        description: "Receive funds through our approved IMTO partners.",
        href: "/transactions/receive/imto",
      },
    ] as const,
  },
} as const;

type OptionType = keyof typeof OPTION_CONFIG;

export default function NewTransactionByOptionPage() {
  const params = useParams();
  const optionType = (params?.optionType as string)?.toLowerCase() as OptionType;
  const config = OPTION_CONFIG[optionType] ?? OPTION_CONFIG.buy;
  const options = config.options;

  return (
    <div className="space-y-8 rounded-2xl bg-white p-4 min-h-screen">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-body-heading-300 text-2xl font-semibold">
            {config.heading}
          </h1>
          <p className="text-body-text-200 max-w-sm text-lg">
            {config.subheading}
          </p>
        </div>
      </div>

      {options.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          {options.map((opt, i) => (
            <FxTransactionTypeCard
              key={i}
              icon={<opt.icon />}
              title={opt.title}
              description={opt.description}
              href={opt.href}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 py-12 text-center">
          <p className="text-body-text-200 text-base">
            This option is not available yet. Please check back later.
          </p>
        </div>
      )}
    </div>
  );
}
