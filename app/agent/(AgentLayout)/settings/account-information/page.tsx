"use client";

import { Avatar } from "@mantine/core";
import { getStatusBadge } from "@/app/(customer)/_utils/status-badge";

const MOCK_ACCOUNT = {
  name: "Micheal Smith Joshson",
  status: "Active",
  customerId: "7833",
  email: "mic@gmail.com",
  phone: "+234 90 4747 2791",
  dateJoined: "April 14 2023",
  lastActive: "November 14 2023",
  bvn: "78338734938444",
  tin: "378393784AGHA",
  gender: "Male",
  dateOfBirth: "April 14 2000",
};

const FIELDS_ROW_1 = [
  { label: "Customer ID", value: MOCK_ACCOUNT.customerId },
  { label: "Email Address", value: MOCK_ACCOUNT.email },
  { label: "Phone Number", value: MOCK_ACCOUNT.phone },
  { label: "Date Joined", value: MOCK_ACCOUNT.dateJoined },
  { label: "Last Active", value: MOCK_ACCOUNT.lastActive },
];

const FIELDS_ROW_2 = [
  { label: "BVN", value: MOCK_ACCOUNT.bvn },
  { label: "TIN", value: MOCK_ACCOUNT.tin },
  { label: "Gender", value: MOCK_ACCOUNT.gender },
  { label: "Date of Birth", value: MOCK_ACCOUNT.dateOfBirth },
  { label: "Last Active", value: MOCK_ACCOUNT.lastActive },
];

function FieldGrid({ fields }: { fields: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {fields.map(({ label, value }) => (
        <div key={label} className="flex flex-col justify-center gap-2">
          <span className="text-base font-normal leading-6 text-[#8F8B8B]">
            {label}
          </span>
          <span className="text-base font-medium leading-6 text-[#4D4B4B]">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AccountInformationPage() {
  return (
    <div
      className="flex flex-col rounded-2xl bg-white pb-8"
      style={{
        border: "1.5px solid #F2F4F7",
        boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
      }}
    >
      {/* Header: avatar + name + badge */}
      <div className="flex flex-row flex-wrap items-start gap-3 border-b border-gray-100 px-6 py-6 pt-8 sm:px-8 md:px-10">
        <Avatar
          src="https://placehold.co/120x120/?text=MS"
          name={MOCK_ACCOUNT.name}
          color="primary"
          size={60}
          radius="xl"
          className="shrink-0"
        />
        <div className="flex min-w-0 flex-col gap-3">
          <h2 className="text-2xl font-medium leading-8 tracking-[-0.032em] text-[#131212]">
            {MOCK_ACCOUNT.name}
          </h2>
          <div style={getStatusBadge(MOCK_ACCOUNT.status)}>
            {MOCK_ACCOUNT.status}
          </div>
        </div>
      </div>

      {/* Details sections */}
      <div className="flex flex-col gap-4 px-6 pt-6 sm:px-8 md:px-10">
        <div className="flex flex-col gap-4">
          <FieldGrid fields={FIELDS_ROW_1} />
        </div>
        <div className="flex flex-col gap-4">
          <FieldGrid fields={FIELDS_ROW_2} />
        </div>
      </div>
    </div>
  );
}
