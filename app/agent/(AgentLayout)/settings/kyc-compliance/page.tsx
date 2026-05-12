"use client";

import SectionCard from "@/app/(customer)/_components/dashboard/SectionCard";
import { Text, Badge, Group } from "@mantine/core";
import { Download } from "lucide-react";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-primary-400 mb-4">
      {children}
    </h2>
  );
}

function Field({
  label,
  value,
  isDownload,
}: {
  label: string;
  value: string;
  isDownload?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900">{value}</span>
        {isDownload && (
          <a
            href="#"
            className="text-primary-400 hover:text-primary-500 inline-flex"
            aria-label="Download"
          >
            <Download size={14} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function KYCCompliancePage() {
  return (
    <SectionCard className="rounded-2xl p-4 md:p-6  mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <Group gap="sm" align="center">
          <Text size="sm" c="dimmed">
            KYC Verification status
          </Text>
          <Badge color="green" variant="light" size="sm">
            Success
          </Badge>
        </Group>

        {/* Basic Information */}
        <section>
          <SectionHeading>Basic Information</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" value="Fiyin Familua" />
            <Field label="Phone Number" value="+234 816 7286 771" />
            <Field label="Email Address" value="fiyin@sbsc.com" />
            <Field label="Business trading name" value="Adekunle and sons" />
          </div>
        </section>

        {/* Identity Verification */}
        <section>
          <SectionHeading>Identity Verification</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Transaction ID" value="2223334355" />
            <Field label="Amount" value="NGN 400,000.00" />
            <Field label="Equivalent Amount" value="$ 400" />
            <Field label="Date initiated" value="25 Jun 2025" />
            <Field label="Pickup Date & Time" value="3rd Feb, 2026. 1:00PM" />
          </div>
        </section>

        {/* Beneficiary Details */}
        <section>
          <SectionHeading>Beneficiary Details</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Beneficiary Address" value="2223334355" />
            <Field label="Beneficiary" value="Adeola Aderinsola" />
            <Field label="Beneficiary Bank" value="First Bank" />
            <Field label="Routing Number" value="278347" />
            <Field label="Bank Address" value="27833987" />
            <Field label="SWIFT CODE" value="400" />
            <Field label="Account Number" value="5004893108" />
          </div>
        </section>

        {/* Required Documents */}
        <section>
          <SectionHeading>Required Documents</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="BVN" value="2223334355" />
            <Field label="NIN" value="25316717237" />
            <Field label="Form A ID" value="23456786543" />
            <Field label="International Passport Number" value="13456786543" />
            <Field label="Evidence of Membership" value="Doc.pdf" isDownload />
            <Field label="Evidence of Membership" value="13456786543" />
            <Field
              label="Invoice from Professional Body"
              value="Doc.pdf"
              isDownload
            />
            <Field label="Invoice from Professional Body" value="13456786543" />
          </div>
        </section>

        {/* TIN & Compliance Documents */}
        <section>
          <SectionHeading>TIN & Compliance Documents</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="TIN number" value="783383AXSH" />
            <Field label="TIN Certificate" value="17 Nov 2025" />
          </div>
        </section>
      </div>
    </SectionCard>
  );
}
