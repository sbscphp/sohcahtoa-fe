"use client";

import { useState, useMemo } from "react";
import { useSetHeaderContent } from "../../_hooks/useSetHeaderContent";
import FranchiseSection from "./_outletComponents/FranchiseSection";
import BranchSection from "./_outletComponents/BranchSection";

export default function OutletPage() {
  const [activeTab, setActiveTab] = useState<"franchise" | "branches">("franchise");

  const headerContent = useMemo(
    () => (
      <div className="flex items-center gap-6 px-6">
        <button
          onClick={() => setActiveTab("franchise")}
          className={`relative px-1 pb-3 cursor-pointer hover:text-primary-500 text-sm font-medium transition-colors ${
            activeTab === "franchise"
              ? "text-primary-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Franchise
          {activeTab === "franchise" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("branches")}
          className={`relative px-1 pb-3 cursor-pointer hover:text-primary-500 text-sm font-medium transition-colors ${
            activeTab === "branches"
              ? "text-primary-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Branches
          {activeTab === "branches" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
          )}
        </button>
      </div>
    ),
    [activeTab]
  );

  useSetHeaderContent(headerContent);

  return (
    <div className="space-y-4">
      {activeTab === "franchise" ? <FranchiseSection /> : <BranchSection />}
    </div>
  );
}
