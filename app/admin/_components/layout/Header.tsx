"use client";

import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useMediaQuery } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getBreadcrumbs } from "@/lib/adminBreadcrumbs";
import { useHeaderContent } from "../../_contexts/HeaderContentContext";

type HeaderProps = {
  title?: string;
  collapsed: boolean;
  setCollapsed: () => void;
  toggleMobile?: () => void;
};

export default function Header({
  title,
  collapsed,
  setCollapsed,
  toggleMobile
}: HeaderProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const { content } = useHeaderContent();

  // Use last breadcrumb as title if breadcrumbs exist, otherwise use provided title
  const displayTitle = breadcrumbs.length > 0
    ? breadcrumbs[breadcrumbs.length - 1].label
    : title;

  return (
    <>
      <header className=" bg-white px-6 flex items-center justify-between w-full relative">
        <div className="flex items-start flex-col justify-between">
          <div className="h-16 flex items-center gap-4">
            {isMobile && toggleMobile
              ? <button
                onClick={toggleMobile}
                className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Menu size={20} className="text-body-text-300" />
              </button>
              : <button
                onClick={setCollapsed}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-50 drop-shadow shadow-sm transition-colors z-50 bg-white"
              >
                <ChevronLeft
                  className={`w-5 h-5 transition-transform duration-300 ease-in-out text-body-text-300 ${collapsed
                    ? "rotate-180"
                    : ""}`}
                />
              </button>}
            {/* Page Title */}
            {displayTitle &&
              <div className="flex items-center gap-2 ml-4">
                <h1 className="text-body-heading-300 text-lg font-semibold">
                  {displayTitle}
                </h1>
              </div>}
          </div>
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 px-6 py-3 bg-white">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                  <div key={index} className="flex items-center gap-2">
                    {crumb.url ? (
                      <Link
                        href={crumb.url}
                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-900 font-medium">
                        {crumb.label}
                      </span>
                    )}

                    {!isLast && (
                      <ChevronRight size={16} className="text-gray-300" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {/* Dynamic Header Content */}
          {content && (
            <div className="w-full bg-white mt-2">
              {content}
            </div>
          )}
        </div>

      </header>

    </>
  );
}
