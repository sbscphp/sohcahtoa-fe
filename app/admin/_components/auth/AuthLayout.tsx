"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { AuthSlideshow } from "@/app/admin/login/AuthSlideshow";
import { logo } from "@/app/assets/asset";
import { adminRoutes } from "@/lib/adminRoutes";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children}: AuthLayoutProps) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex p-3">
      {/* Left Column - Marketing/Information */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/3 bg-bg-card-2 p-8 xl:p-12 flex-col justify-between rounded-lg">
        <div>
          {/* Logo */}
          <div className="flex cursor-pointer items-center gap-3 mb-12">
            <Image src={logo} alt="SohCahToa" onClick={() => router.push(adminRoutes.adminLogin())} />
          </div>

          {/* Headline and Description */}
          <div>
            <h2 className="text-heading-200 text-4xl font-bold mb-4">
              Welcome to the <br /> Back-Office Portal
            </h2>

            <p className="text-body-text-100 text-sm leading-relaxed">
              Your central workspace for settlement control, rate configuration,
              and franchise oversight — all in one dependable place.
            </p>
          </div>
        </div>

        {/* Bottom section - AuthSlideshow */}
        <div>
          <AuthSlideshow />
        </div>
      </div>

      {/* Right Column - Form Content */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-xl">{children}</div>
      </div>
    </div>
  );
}
