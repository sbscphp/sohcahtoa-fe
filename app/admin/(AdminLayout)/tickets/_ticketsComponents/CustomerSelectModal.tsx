"use client";

import { useState, useMemo } from "react";
import { Modal, TextInput, Text, ScrollArea } from "@mantine/core";
import { Search } from "lucide-react";

export interface CustomerOption {
  id: string;
  name: string;
  email: string;
}

interface CustomerSelectModalProps {
  value: CustomerOption | null;
  onChange: (customer: CustomerOption | null) => void;
  error?: string;
  required?: boolean;
}

const MOCK_CUSTOMERS: CustomerOption[] = [
  { id: "12536", name: "Adekunle, Ibrahim", email: "kibrahim@sohcahtoa.com" },
  { id: "12537", name: "Adewale, Emmanuel", email: "aemmanuel@sohcahtoa.com" },
  { id: "12538", name: "Afolabi, Funke", email: "fafolabi@sohcahtoa.com" },
  { id: "12539", name: "Oluwaseun, Adebayo", email: "adebayo@sohcahtoa.com" },
  { id: "12540", name: "Chidinma, Nwosu", email: "cnwosu@sohcahtoa.com" },
  { id: "12541", name: "Tunde, Bakare", email: "tbakare@sohcahtoa.com" },
  { id: "12542", name: "Amaka, Okonkwo", email: "aokonkwo@sohcahtoa.com" },
  { id: "12543", name: "Chukwuemeka, Eze", email: "ceze@sohcahtoa.com" },
];

function getInitials(name: string): string {
  return name
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function CustomerSelectModal({
  value,
  onChange,
  error,
  required = false,
}: CustomerSelectModalProps) {
  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return MOCK_CUSTOMERS;
    const q = search.toLowerCase().trim();
    return MOCK_CUSTOMERS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.includes(q)
    );
  }, [search]);

  const handleSelect = (customer: CustomerOption) => {
    onChange(customer);
    setOpened(false);
    setSearch("");
  };

  const handleOpen = () => setOpened(true);
  const handleClose = () => {
    setOpened(false);
    setSearch("");
  };

  return (
    <>
      {/* Trigger */}
      <div className="w-full">
        <Text size="sm" fw={500} mb={8}>
          Customer
          {required && <span className="text-red-500 ml-1">*</span>}
        </Text>
        <div
          role="button"
          tabIndex={0}
          onClick={handleOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleOpen();
            }
          }}
          className={`
            flex items-center gap-2 w-full min-h-[42px] px-3 rounded-md border
            cursor-pointer transition-colors
            ${error ? "border-red-500" : "border-gray-300"}
            hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20
          `}
        >
          <span className="flex-1 text-left text-sm text-gray-500 truncate">
            {value
              ? `${value.name} (ID: ${value.id})`
              : "Search with ID or name"}
          </span>
          <Search size={16} className="shrink-0 text-orange-500" />
        </div>
        {error && (
          <Text size="xs" c="red" mt={4}>
            {error}
          </Text>
        )}
      </div>

      {/* Modal */}
      <Modal
        opened={opened}
        onClose={handleClose}
        title={
          <div>
            <Text fw={700} size="lg" className="text-gray-900">
              Customer
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              Select customer below
            </Text>
          </div>
        }
        centered
        radius="lg"
        size="md"
        classNames={{ title: "!mb-0" }}
      >
        <div className="space-y-4 pt-2">
          <TextInput
            placeholder="Enter keyword to search"
            leftSection={<Search size={16} color="#DD4F05" />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            radius="md"
            size="md"
          />
          <ScrollArea h={320} type="scroll">
            <div className="divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <Text size="sm" c="dimmed" py="xl" ta="center">
                  No customers found
                </Text>
              ) : (
                filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleSelect(customer)}
                    className="flex w-full items-center gap-3 px-2 py-3 text-left hover:bg-orange-50/50 transition-colors rounded"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-sm font-semibold"
                      aria-hidden
                    >
                      {getInitials(customer.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text fw={600} size="sm" className="text-gray-900 truncate">
                        {customer.name}
                      </Text>
                      <Text size="xs" c="dimmed" className="truncate">
                        {customer.email}
                      </Text>
                    </div>
                    <span
                      className="shrink-0 rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700"
                      aria-hidden
                    >
                      ID: {customer.id}
                    </span>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </Modal>
    </>
  );
}
