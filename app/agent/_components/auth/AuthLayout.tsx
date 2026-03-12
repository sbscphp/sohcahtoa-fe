"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { agentFlag, logo } from "@/app/assets/asset";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AgentAuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex p-3">
      {/* Left Column - Branding and Information */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/3 bg-bg-card-2 p-8 xl:p-12 flex-col justify-between rounded-lg relative overflow-hidden">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <Image src={logo} alt="SohCahToa" width={100} height={100} />
          </div>

          {/* Headline and Description */}
          <div>
            <h2 className="text-heading-200 text-4xl font-bold mb-4">
              Welcome to SOHCAHTOA Agent
            </h2>

            <p className="text-body-text-100 text-sm leading-relaxed">
              Log in with your newly created credentials to access your
              SOHCAHTOA Agent account.
            </p>
          </div>
        </div>

        {/* Visual Elements - Country Flags */}
        <div className="flex flex-wrap gap-4 justify-start w-full h-[40%] absolute bottom-0 left-0">
          {/* Country flag icons would go here - using placeholder circles for now */}
          <Image
            src={agentFlag}
            alt="Agent Flag"
            width={100}
            height={100}
            className="w-full h-full object-contain relative -right-10"
          />
        </div>
      </div>

      {/* Right Column - Form Content */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-xl">{children}</div>
      </div>
    </div>
  );
}
