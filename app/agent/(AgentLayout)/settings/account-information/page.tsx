 "use client";

import { Avatar } from "@mantine/core";
import { useAtom } from "jotai";
import { getStatusBadge } from "@/app/(customer)/_utils/status-badge";
import { userProfileAtom } from "@/app/_lib/atoms/auth-atom";
import { formatAccountDate as formatDate, formatAccountPhone as formatPhone } from "@/app/_lib/utils/account-format";

const FIELDS_ROW_1_LABELS = {
  agentId: "Agent ID",
  email: "Email Address",
  phone: "Phone Number",
  dateJoined: "Date Joined",
  lastActive: "Last Active",
} as const;

const FIELDS_ROW_2_LABELS = {
  bvn: "BVN",
  tin: "TIN",
  dateOfBirth: "Date of Birth",
} as const;

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
  const [userProfile] = useAtom(userProfileAtom);

  if (!userProfile) {
    return null;
  }

  const displayName =
    userProfile.profile?.fullName ||
    [userProfile.profile?.firstName, userProfile.profile?.lastName].filter(Boolean).join(" ") ||
    userProfile.email?.split("@")[0] ||
    "Agent";

  const avatarUrl = userProfile.profile?.avatar || undefined;
  const initials =
    userProfile.profile?.firstName?.[0] ||
    userProfile.profile?.lastName?.[0] ||
    userProfile.email?.[0]?.toUpperCase() ||
    "A";

  const status = userProfile.isActive ? "Active" : "Inactive";
  const agentId = userProfile.id.slice(0, 8).toUpperCase();
  const email = userProfile.email || "N/A";
  const phone = formatPhone(userProfile.phoneNumber);
  const dateJoined = formatDate(userProfile.createdAt);
  const lastActive = formatDate(userProfile.updatedAt);
  const bvn = userProfile.kyc?.bvn || "N/A";
  const tin = userProfile.kyc?.tin || "N/A";
  const dateOfBirth = formatDate(userProfile.profile?.dateOfBirth);

  const FIELDS_ROW_1 = [
    { label: FIELDS_ROW_1_LABELS.agentId, value: agentId },
    { label: FIELDS_ROW_1_LABELS.email, value: email },
    { label: FIELDS_ROW_1_LABELS.phone, value: phone },
    { label: FIELDS_ROW_1_LABELS.dateJoined, value: dateJoined },
    { label: FIELDS_ROW_1_LABELS.lastActive, value: lastActive },
  ];

  const FIELDS_ROW_2 = [
    { label: FIELDS_ROW_2_LABELS.bvn, value: bvn },
    { label: FIELDS_ROW_2_LABELS.tin, value: tin },
    { label: FIELDS_ROW_2_LABELS.dateOfBirth, value: dateOfBirth },
  ];

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
        <Avatar src={avatarUrl} name={displayName} color="primary" size={60} radius="xl" className="shrink-0">
          {initials}
        </Avatar>
        <div className="flex min-w-0 flex-col gap-3">
          <h2 className="text-2xl font-medium leading-8 tracking-[-0.032em] text-[#131212]">
            {displayName}
          </h2>
          <div style={getStatusBadge(status)}>
            {status}
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
