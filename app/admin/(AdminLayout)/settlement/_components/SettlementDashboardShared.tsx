"use client";

import React from "react";
import { Text, Group, Badge } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";

export function StatCard({
  title,
  value,
  icon,
  iconBg,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h4 className="text-xl font-bold text-gray-900">{value}</h4>
      </div>
    </div>
  );
}

export function SectionHeader({ title }: { title: string }) {
  return (
    <Group justify="space-between" mb="lg">
      <Text fw={700} size="lg" c="dark">{title}</Text>
      <Group gap={4} className="text-orange-600 cursor-pointer hover:text-orange-700">
        <Text size="sm" fw={600}>View all</Text>
        <ArrowUpRight size={16} />
      </Group>
    </Group>
  );
}

export function PriorityBadge({ level }: { level: string }) {
  let styles: { bg: string; c: string; color: string } = { bg: "bg-gray-100", c: "text-gray-600", color: "gray" };
  if (level === "High") styles = { bg: "bg-red-50", c: "text-red-600", color: "red" };
  if (level === "Medium") styles = { bg: "bg-orange-50", c: "text-orange-600", color: "orange" };
  if (level === "Low") styles = { bg: "bg-blue-50", c: "text-blue-600", color: "blue" };

  return (
    <Badge variant="light" radius="sm" color={styles.color} className={`${styles.bg} ${styles.c} capitalize`}>
      {level}
    </Badge>
  );
}
