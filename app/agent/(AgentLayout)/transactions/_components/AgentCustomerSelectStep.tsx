"use client";

import { useEffect, useMemo, useState } from "react";
import { TextInput, Button, Skeleton, Pagination } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { Search } from "lucide-react";
import { useFetchData } from "@/app/_lib/api/hooks";
import { agentKeys } from "@/app/_lib/api/query-keys";
import type { AgentCustomerSummary } from "@/app/_lib/api/types";
import { sanitizeSearchQuery } from "@/app/_lib/input-field-rules";
import { agentApi } from "@/app/agent/_services/agent-api";
import { CustomerInterface } from "../constant";

const PAGE_SIZE = 10;

interface AgentCustomerSelectStepProps {
  onSubmit: (customer: CustomerInterface) => void;
  onAddCustomer: () => void;
  selectedCustomer?: CustomerInterface | null;
}

function getCustomerKey(item: Pick<CustomerInterface, "userId">): string {
  return (item?.userId ?? "").toString();
}

function toCustomerInterface(item: AgentCustomerSummary): CustomerInterface {
  return {
    userId: item.userId,
    fullName: item.fullName,
    customerType: item.customerType,
    lastTransactionType: item.lastTransactionType ?? "",
    registeredAt: item.registeredAt,
    kycStatus: item.kycStatus,
    nin: item.nin ?? null,
    bvn: item.bvn ?? null,
  };
}

export function AgentCustomerSelectStep({
  onSubmit,
  onAddCustomer,
  selectedCustomer,
}: Readonly<AgentCustomerSelectStepProps>) {
  const [pickedCustomer, setPickedCustomer] = useState<CustomerInterface | null>(
    selectedCustomer ?? null
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedSearch] = useDebouncedValue(search, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    setPickedCustomer(selectedCustomer ?? null);
  }, [selectedCustomer]);

  const listParams = useMemo(
    () => ({
      page,
      limit: 5,
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch, page]
  );

  const { data, isLoading, isFetching } = useFetchData(
    [...agentKeys.customers.list(listParams)],
    () => agentApi.customers.list(listParams),
    true
  );

  const customers = useMemo(
    () => (data?.data ?? []).map(toCustomerInterface),
    [data?.data]
  );

  const pagination = data?.metadata?.pagination;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const effectiveSelectedKey = pickedCustomer ? getCustomerKey(pickedCustomer) : null;

  const handleSelect = () => {
    if (!pickedCustomer) return;
    onSubmit(pickedCustomer);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-[736px] mx-auto">
      <div className="flex flex-col items-center gap-1 text-center max-w-xl">
        <h2 className="text-body-heading-300 text-2xl md:text-3xl font-semibold">
          Select Customer
        </h2>
        <p className="text-body-text-200 text-sm md:text-base">
          Select the customer from the list or add a new customer to continue with the
          transaction.
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)] p-4 md:p-6">
          <p className="text-[#6C6969] text-sm md:text-base">Search Customer</p>
          <TextInput
            value={search}
            onChange={(e) => setSearch(sanitizeSearchQuery(e.currentTarget.value))}
            leftSection={<Search className="w-4 h-4 text-[#DD4F05]" />}
            placeholder="Search by name or customer ID..."
            size="md"
            radius="md"
          />
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)] p-4 md:p-6">
          <p className="text-[#6C6969] text-sm md:text-base">Select Customer</p>

          <div
            className={`flex flex-col gap-3 ${isFetching && !isLoading ? "opacity-60" : ""}`}
          >
            {isLoading && (
              <div className="flex flex-col gap-3">
                <Skeleton height={60} width="100%" />
                <Skeleton height={60} width="100%" />
              </div>
            )}

            {!isLoading && customers.length === 0 && (
              <p className="text-body-text-300 text-sm">
                No customers found. You can add a new customer below.
              </p>
            )}

            {!isLoading &&
              customers.map((item) => {
                const key = getCustomerKey(item);
                const isActive = effectiveSelectedKey === key;
                const name = item.fullName || "Unnamed";
                const customerType = item.customerType || "Resident";
                const lastTransactionLabel = "Last Transaction";
                const lastTransactionDate = item.lastTransactionType || "—";

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPickedCustomer(isActive ? null : item)}
                    className={`flex w-full flex-row items-start gap-4 rounded-lg border px-4 py-3 text-left transition-colors cursor-pointer ${
                      isActive
                        ? "border-primary-500 bg-[#FFF6F1]"
                        : "border-[#E1E0E0] bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-1 flex-row items-start justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-row items-center gap-2">
                          <span className="text-sm font-medium text-[#4D4B4B]">{name}</span>
                        </div>
                        <p className="text-xs md:text-sm text-[#8F8B8B]">
                          {customerType || "Resident"}
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

          {!isLoading && totalPages > 1 ? (
            <div className="flex justify-center pt-2">
              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
                size="sm"
                radius="md"
              />
            </div>
          ) : null}

          <button
            type="button"
            onClick={onAddCustomer}
            disabled={Boolean(effectiveSelectedKey)}
            className="mt-2 flex w-full items-center justify-center rounded-full border border-dashed border-[#E88A58] bg-[#FFF6F1] px-4 py-2 text-sm font-medium text-[#E36C2F] disabled:cursor-not-allowed disabled:border-[#E1E0E0] disabled:bg-gray-50 disabled:text-[#8F8B8B]"
          >
            Add New Customer +
          </button>
        </div>

        <div className="flex flex-row justify-end">
          <Button
            variant="filled"
            radius="xl"
            onClick={handleSelect}
            disabled={!effectiveSelectedKey}
            className="min-w-[120px] bg-primary-500 text-white hover:bg-primary-600"
          >
            Select
          </Button>
        </div>
      </div>
    </div>
  );
}
