"use client"

import { adminRoutes } from "@/lib/adminRoutes";
import { Avatar } from "@mantine/core";
import { StatusBadge } from "../../_components/StatusBadge";


const userInfo = {
  name: "Micheal Smith Joshua",
  status: "Active",
  userId: "7833",
  email: "nic@gmail.com",
  phone: "+234 90 4747 2791",
  dateJoined: "April 14 2023",
  role: "78338734938444",
  department: "378393784AGHA",
  gender: "Male",
  lastActive: "November 14 2023",
}

export default function AccountInformationTab() {
  return (
    <div className="mx-auto w-full bg-white p-5 rounded-lg">
      {/* Profile Header */}
      <div className="flex items-center gap-5 pb-8">
        {/* Avatar stack */}
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-50 flex items-center justify-center overflow-hidden shrink-0">
              <Avatar src={`https://placehold.co/600x400/?text=MS`} name="Michael Smith" color="initials" />
            </div>
          </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-foreground">{userInfo.name}</h2>
          <StatusBadge status={userInfo.status} />
        </div>
      </div>

      {/* Info Grid */}
      <div >
        <div className="grid grid-cols-4 gap-y-8">
          <InfoField label="User ID" value={userInfo.userId} />
          <InfoField label="Email Address" value={userInfo.email} />
          <InfoField label="Phone Number" value={userInfo.phone} />
          <InfoField label="Date Joined" value={userInfo.dateJoined} />
          <InfoField label="Role" value={userInfo.role} />
          <InfoField label="Department" value={userInfo.department} />
          <InfoField label="Gender" value={userInfo.gender} />
          <InfoField label="Last Active" value={userInfo.lastActive} />
        </div>
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-foreground/50">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}
