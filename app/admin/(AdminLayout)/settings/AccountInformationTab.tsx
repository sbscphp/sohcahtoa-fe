"use client"

import { Avatar, Skeleton } from "@mantine/core";
import { StatusBadge } from "../../_components/StatusBadge";
import EmptyState from "@/app/admin/_components/EmptyState";
import { useFetchSingleData } from "@/app/_lib/api/hooks";
import { adminKeys } from "@/app/_lib/api/query-keys";
import { adminApi, type AdminProfileData } from "@/app/admin/_services/admin-api";
import type { ApiResponse } from "@/app/_lib/api/client";

function formatDate(value?: string | null): string {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function AccountInformationTab() {
  const profileQuery = useFetchSingleData<ApiResponse<AdminProfileData | null>>(
    [...adminKeys.auth.profile()],
    () => adminApi.management.profile(),
    true
  );

  const profile = profileQuery.data?.data ?? null;
  const isLoading = profileQuery.isLoading || profileQuery.isFetching;

  if (isLoading) {
    return (
      <div className="mx-auto w-full bg-white p-5 rounded-lg">
        <div className="flex items-center gap-5 pb-8">
          <Skeleton circle height={40} width={40} />
          <div className="flex flex-col gap-1">
            <Skeleton height={22} width="60%" radius="sm" />
            <Skeleton height={26} width={96} radius="xl" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-y-8">
          <InfoField label="User ID" loading />
          <InfoField label="Email Address" loading />
          <InfoField label="Phone Number" loading />
          <InfoField label="Date Joined" loading />
          <InfoField label="Role" loading />
          <InfoField label="Department" loading />
          <InfoField label="Gender" loading />
          <InfoField label="Last Active" loading />
        </div>
      </div>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <div className="mx-auto w-full bg-white p-5 rounded-lg">
        <EmptyState
          title="No Profile Available"
          description="We couldn't load your admin profile right now. Please try again later."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full bg-white p-5 rounded-lg">
      {/* Profile Header */}
      <div className="flex items-center gap-5 pb-8">
        {/* Avatar stack */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-50 flex items-center justify-center overflow-hidden shrink-0">
            <Avatar name={profile.fullName} color="initials" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-foreground">{profile.fullName}</h2>
          <StatusBadge status={profile.isActive ? "Active" : "Inactive"} />
        </div>
      </div>

      {/* Info Grid */}
      <div>
        <div className="grid grid-cols-4 gap-y-8">
          <InfoField label="User ID" value={profile.id} />
          <InfoField label="Email Address" value={profile.email} />
          <InfoField label="Phone Number" value={profile.phoneNumber} />
          <InfoField label="Date Joined" value={formatDate(profile.createdAt)} />
          <InfoField label="Role" value={profile.roleId} />
          <InfoField label="Department" value={profile.departmentId} />
          <InfoField label="Gender" value={profile.position ?? "--"} />
          <InfoField label="Last Active" value={formatDate(profile.updatedAt)} />
        </div>
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
  loading = false,
}: {
  label: string;
  value?: string | null;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-foreground/50">{label}</span>
      {loading ? (
        <Skeleton height={16} width="70%" radius="sm" />
      ) : (
        <span className="text-sm font-medium text-foreground">{value ?? "--"}</span>
      )}
    </div>
  );
}
