"use client";

import { useMemo, useState } from "react";
import { TextInput, Button } from "@mantine/core";
import { Search } from "lucide-react";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";

interface AgentCustomerSelectStepProps {
  onSubmit: (customer: unknown) => void;
  onAddCustomer: () => void;
  onBack: () => void;
}

export function AgentCustomerSelectStep({
  onSubmit,
  onAddCustomer,
  onBack,
}: AgentCustomerSelectStepProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useFetchData(
    ["agent", "customers"],
    () => agentApi.customers.list(),
    true
  );

  const customers = useMemo(() => {
    const list = (data?.data as unknown[]) || [];
    if (!search.trim()) return list;
    const term = search.toLowerCase();
    return list.filter((item: any) => {
      const name = (item.name || item.fullName || item.customerName || "").toLowerCase();
      const ref = (item.reference || item.refId || item.id || "").toString().toLowerCase();
      return name.includes(term) || ref.includes(term);
    });
  }, [data, search]);

  const handleSelect = () => {
    if (selectedIndex == null) return;
    const list = (customers as unknown[]) || [];
    const customer = list[selectedIndex];
    if (!customer) return;
    onSubmit(customer);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-[736px] mx-auto">
      {/* Header text */}
      <div className="flex flex-col items-center gap-1 text-center max-w-xl">
        <h2 className="text-body-heading-300 text-2xl md:text-3xl font-semibold text-[#323131]">
          Select Customer
        </h2>
        <p className="text-body-text-200 text-sm md:text-base text-[#6C6969]">
          Select the customer from the list or add a new customer to continue with the
          transaction.
        </p>
      </div>

      {/* Content cards */}
      <div className="flex flex-col gap-6 w-full">
        {/* Search card */}
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)] p-4 md:p-6">
          <p className="text-[#6C6969] text-sm md:text-base">Search Customer</p>
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            leftSection={<Search className="w-4 h-4 text-[#DD4F05]" />}
            placeholder="Search by name, or transaction ID..."
            size="md"
            radius="md"
          />
        </div>

        {/* List card */}
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)] p-4 md:p-6">
          <p className="text-[#6C6969] text-sm md:text-base">Select Customer</p>

          <div className="flex flex-col gap-3">
            {isLoading && (
              <p className="text-body-text-300 text-sm">Loading customers...</p>
            )}

            {!isLoading && customers.length === 0 && (
              <p className="text-body-text-300 text-sm">
                No customers found. You can add a new customer below.
              </p>
            )}

            {!isLoading &&
              customers.map((item: any, index: number) => {
                const isActive = selectedIndex === index;
                const name = item.name || item.fullName || item.customerName || "Unnamed";
                const reference = item.reference || item.refId || item.id || "";
                const customerType =
                  item.customerType || item.type || item.residency || "Resident";
                const lastTransactionLabel = "Last Transaction";
                const lastTransactionDate =
                  item.lastTransactionDate || item.lastTransactionAt || "—";

                return (
                  <button
                    key={reference || index}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`flex w-full flex-row items-start gap-4 rounded-lg border px-4 py-3 text-left transition-colors ${
                      isActive
                        ? "border-primary-500 bg-[#FFF6F1]"
                        : "border-[#E1E0E0] bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-1 flex-row items-start justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-row items-center gap-2">
                          <span className="text-sm font-medium text-[#4D4B4B]">{name}</span>
                          {reference && (
                            <span className="inline-flex items-center gap-1 rounded-2xl bg-[#F2F4F7] px-2 py-0.5 text-xs font-medium text-[#344054]">
                              <span className="h-2 w-2 rounded-full bg-[#667085]" />
                              Ref.ID: #{reference}
                            </span>
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-[#8F8B8B]">
                          {customerType}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs md:text-sm font-medium text-[#4D4B4B]">
                          {lastTransactionLabel}
                        </span>
                        <span className="text-xs md:text-sm text-[#8F8B8B]">
                          {lastTransactionDate}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Add new customer button */}
          <button
            type="button"
            onClick={onAddCustomer}
            className="mt-2 flex w-full items-center justify-center rounded-full border border-dashed border-[#E88A58] bg-[#FFF6F1] px-4 py-2 text-sm font-medium text-[#E36C2F]"
          >
            Add New Customer +
          </button>
        </div>

        {/* Footer actions */}
        <div className="flex flex-row justify-end gap-4">
          <Button
            variant="outline"
            radius="xl"
            onClick={onBack}
            className="min-w-[120px] border-[#CCCACA] text-[#4D4B4B]"
          >
            Back
          </Button>
          <Button
            variant="filled"
            radius="xl"
            onClick={handleSelect}
            disabled={selectedIndex == null}
            className="min-w-[120px] bg-primary-500 text-white hover:bg-primary-600"
          >
            Select
          </Button>
        </div>
      </div>
    </div>
  );
}

