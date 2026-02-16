"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { logo } from "@/app/assets/asset";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AgentAuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex p-3">
      {/* Left Column - Branding and Information */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/3 bg-bg-card-2 p-8 xl:p-12 flex-col justify-between rounded-lg">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <Image src={logo} alt="SohCahToa" width={40} height={40} />
            <div>
              <div className="text-heading-200 text-xl font-bold">SohCahToa</div>
              <div className="text-body-text-100 text-sm">Payout BDC</div>
            </div>
          </div>

          {/* Headline and Description */}
          <div>
            <h2 className="text-heading-200 text-4xl font-bold mb-4">
              Welcome to SOHCAHTOA Agent
            </h2>

            <p className="text-body-text-100 text-sm leading-relaxed">
              Log in with your newly created credentials to access your SOHCAHTOA Agent account.
            </p>
          </div>
        </div>

        {/* Visual Elements - Country Flags */}
        <div className="flex flex-wrap gap-4 justify-start">
          {/* Country flag icons would go here - using placeholder circles for now */}
          <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
            <span className="text-xs">🇪🇸</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
            <span className="text-xs">🇸🇦</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
            <span className="text-xs">🇨🇦</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
            <span className="text-xs">🇳🇬</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
            <span className="text-xs">🇺🇸</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
            <span className="text-xs">🇬🇭</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center">
            <span className="text-xs">🇬🇧</span>
          </div>
        </div>
      </div>

      {/* Right Column - Form Content */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-xl">{children}</div>
      </div>
    </div>
  );
}
