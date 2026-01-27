"use client";

import Link from "next/link";
import { Button } from "@mantine/core";
import { MessageSquare } from "lucide-react";

const MOCK_DETAIL: Record<
  string,
  {
    categoryDescription: string;
    date: string;
    status: string;
    email: string;
    userMessage: string;
    supportEmail: string;
    supportDate: string;
    supportMessage: string;
  }
> = {
  "1": {
    categoryDescription: "Failed login/password reset not working",
    date: "Sep 29, 2025 10:28am",
    status: "Approved",
    email: "fiyinsohcahtoa@gmail.com",
    userMessage: `Hello Support,

I am unable to access my account and the password reset link is not working. I have tried multiple times but haven't received any email. Please help.`,
    supportEmail: "support@sohcahtoa.com",
    supportDate: "Sep 29, 2025 10:28am",
    supportMessage: `Hello Fiyin,

We have refreshed your account security settings and sent a new password reset link to your email. Please check your inbox and spam folder. If you still face issues, reply to this thread.`,
  },
  "2": {
    categoryDescription: "Customer unable to access account settings.",
    date: "Oct 29, 2025 10:25am",
    status: "Approved",
    email: "fiyinsohcahtoa@gmail.com",
    userMessage: `Hello Support,

I cannot access my account settings page. It keeps loading indefinitely.`,
    supportEmail: "support@sohcahtoa.com",
    supportDate: "Oct 29, 2025 10:25am",
    supportMessage: `Thank you for reaching out. We've identified and resolved the issue. Please try again.`,
  },
  "3": {
    categoryDescription: "2FA/OTP not delivered.",
    date: "Oct 29, 2025 10:25am",
    status: "Approved",
    email: "fiyinsohcahtoa@gmail.com",
    userMessage: `I am not receiving OTP codes for 2FA.`,
    supportEmail: "support@sohcahtoa.com",
    supportDate: "Oct 29, 2025 10:25am",
    supportMessage: `We've verified your contact and resent the OTP. Please ensure your number is correct in profile settings.`,
  },
  "4": {
    categoryDescription: "BVN/TIN mismatch issue.",
    date: "Oct 29, 2025 10:25am",
    status: "Approved",
    email: "fiyinsohcahtoa@gmail.com",
    userMessage: `My BVN and TIN details are showing as mismatch.`,
    supportEmail: "support@sohcahtoa.com",
    supportDate: "Oct 29, 2025 10:25am",
    supportMessage: `We have escalated to verification. You will receive an update within 24–48 hours.`,
  },
  "5": {
    categoryDescription:
      "Error uploading document (flight ticket, admission letter, Medical bill, etc.)",
    date: "Oct 29, 2025 10:25am",
    status: "Approved",
    email: "fiyinsohcahtoa@gmail.com",
    userMessage: `Upload keeps failing for my documents.`,
    supportEmail: "support@sohcahtoa.com",
    supportDate: "Oct 29, 2025 10:25am",
    supportMessage: `Please ensure files are PDF or JPG under 5MB. We've reset your upload slot; try again.`,
  },
};

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 py-2">
      <span className="text-[#6C6969] text-sm font-normal">{label}</span>
      <span className={`text-[#4D4B4B] text-sm font-medium ${valueClassName ?? ""}`}>
        {value}
      </span>
    </div>
  );
}

export default function ViewSupportDetail({ id }: { id: string }) {
  const data = MOCK_DETAIL[id] ?? MOCK_DETAIL["1"];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 w-full max-w-[720px] mx-auto">
      <div className="space-y-2 mb-6">
        <h2 className="text-body-heading-300 text-xl md:text-2xl font-bold">
          Support
        </h2>
        <p className="text-body-text-200 text-sm md:text-base">
          View request
        </p>
      </div>

      <div className="space-y-4">
        {/* User request */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0">
          <DetailRow label="Category" value={data.categoryDescription} />
          <DetailRow
            label="Status"
            value={data.status}
            valueClassName="text-primary-400"
          />
          <DetailRow label="Date & Time" value={data.date} />
          <DetailRow label="Email" value={data.email} />
        </div>
        <div className="pt-2">
          <p className="text-[#4D4B4B] text-sm font-normal leading-6 whitespace-pre-wrap">
            {data.userMessage}
          </p>
        </div>

        <hr className="border-t border-gray-100 my-6" />

        {/* Support reply */}
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center justify-center w-8 h-8 rounded bg-primary-100 text-primary-400">
            <MessageSquare size={18} />
          </span>
          <span className="text-[#4D4B4B] font-semibold text-sm">Message</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0">
          <DetailRow label="Support team" value={data.supportEmail} />
          <DetailRow
            label="Status"
            value={data.status}
            valueClassName="text-primary-400"
          />
          <DetailRow label="Date & Time" value={data.supportDate} />
          <DetailRow label="Email" value={data.email} />
        </div>
        <div className="pt-2">
          <p className="text-[#4D4B4B] text-sm font-normal leading-6 whitespace-pre-wrap">
            {data.supportMessage}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/support/history">
          <Button
            variant="outline"
            radius="xl"
            className="min-h-[44px] px-6 border-text-50 text-[#4D4B4B] hover:bg-gray-50"
          >
            Back to Support History
          </Button>
        </Link>
      </div>
    </div>
  );
}
