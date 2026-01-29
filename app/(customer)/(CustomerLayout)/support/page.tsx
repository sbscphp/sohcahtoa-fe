import React from "react";
import LandingSupport from "../../_components/support/LandingSupport";
import FAQSection from "../../_components/support/FAQSection";

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <LandingSupport />
      <FAQSection />
    </div>
  );
}
