"use client";

import { Card, Text, Button } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";
import { ReactNode } from "react";

interface SupportCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  ctaText: string;
  onClick?: () => void;
  href?: string;
}

export function SupportCard({
  icon,
  title,
  description,
  ctaText,
  onClick,
  href,
}: SupportCardProps) {
  return (
    <Card radius="md" padding="lg" withBorder className="h-full">
      <div className="flex flex-col h-full">
        <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100">
          {icon}
        </div>
        <Text fw={600} size="lg" mb="xs">
          {title}
        </Text>
        <Text size="sm" c="dimmed" mb="md" className="flex-1">
          {description}
        </Text>
        {href ? (
          <Button
            component="a"
            href={href}
            variant="light"
            color="orange"
            radius="xl"
            rightSection={<ArrowUpRight size={16} />}
            fullWidth
          >
            {ctaText}
          </Button>
        ) : (
          <Button
            variant="light"
            color="orange"
            radius="xl"
            rightSection={<ArrowUpRight size={16} />}
            fullWidth
            onClick={onClick}
          >
            {ctaText}
          </Button>
        )}
      </div>
    </Card>
  );
}
