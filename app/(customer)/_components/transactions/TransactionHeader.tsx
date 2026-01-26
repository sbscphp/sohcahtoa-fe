"use client";

import { Breadcrumbs } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { BreadcrumbItem } from "@/app/(customer)/_utils/transaction-flow";

interface TransactionHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
}

export default function TransactionHeader({
  title,
  breadcrumbs,
}: TransactionHeaderProps) {
  const isNarrow = useMediaQuery("(max-width: 1024px)");
  const lastCrumb = breadcrumbs[breadcrumbs.length - 1];

  return (
    <div className="min-w-0 flex-1 space-y-1 sm:space-y-2">
      <h1
        className="text-body-heading-300 text-base sm:text-lg font-semibold truncate"
        title={title}
      >
        {title}
      </h1>
      {isNarrow ? (
        <p className="text-xs text-body-text-200 truncate" title={lastCrumb?.label}>
          {lastCrumb?.label ?? ""}
        </p>
      ) : (
        <Breadcrumbs
          separator={<ChevronRight size={12} className="text-body-text-300 shrink-0" />}
          className="flex flex-wrap items-center gap-x-1 min-w-0"
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const className = `text-xs shrink-0 ${
              isLast
                ? "text-body-heading-300 font-medium truncate min-w-0 max-w-full"
                : "text-body-text-200 hover:text-primary-400 transition-colors truncate min-w-0 max-w-[120px]"
            }`;

            if (crumb.href && !isLast) {
              return (
                <Link key={index} href={crumb.href} className={className} title={crumb.label}>
                  {crumb.label}
                </Link>
              );
            }

            return (
              <span key={index} className={className} title={crumb.label}>
                {crumb.label}
              </span>
            );
          })}
        </Breadcrumbs>
      )}
    </div>
  );
}
