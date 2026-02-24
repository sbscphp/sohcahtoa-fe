"use client";

import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AgentHeader from "./AgentHeader";
import AgentSidebar from "./AgentSidebar";
import TransactionHeader from "@/app/(customer)/_components/transactions/TransactionHeader";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

const HEADER_HEIGHT = 64;

function AgentLayoutShellContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (isMobile) {
      closeMobile();
    }
  }, [isMobile, closeMobile]);

  const getPageTitle = () => {
    if (pathname === "/agent/dashboard") return "Dashboard";
    if (pathname?.startsWith("/agent/transactions")) return "Transactions";
    if (pathname?.startsWith("/agent/fx-inventory")) return "FX Inventory";
    if (pathname?.startsWith("/agent/customer-management")) {
      if (pathname.includes("/customer-management/") && pathname !== "/agent/customer-management") {
        return "View Customer Details";
      }
      return "Customer Management";
    }
    if (pathname?.startsWith("/agent/support")) {
      if (pathname.includes("/support/chat")) return "Support: Chat Support";
      if (pathname.includes("/support/history")) {
        if (pathname.includes("/history/")) return "View request";
        return "Support History";
      }
      return "Support";
    }
    if (pathname?.startsWith("/agent/rate-calculator")) return "Rate Calculator";
    if (pathname?.startsWith("/agent/settings")) {
      if (pathname === "/agent/settings") return "Setting";
      if (pathname.includes("/account-information")) return "Setting: Account Information";
      if (pathname.includes("/change-password")) return "Setting: Change Password";
      if (pathname.includes("/notifications")) {
        if (pathname.includes("/notifications/settings")) return "Setting: Notifications settings";
        return "Setting: Notification";
      }
      if (pathname.includes("/account-security")) {
        if (pathname.includes("/set-security-question")) return "Setting: Set Security Question";
        if (pathname.includes("/verify-security-question")) return "Setting: Security Verification";
        return "Setting: Account Security";
      }
      return "Setting";
    }
    return "Dashboard";
  };

  const getBreadcrumbs = () => {
    if (pathname?.startsWith("/agent/settings")) {
      if (pathname === "/agent/settings") return undefined;
      if (pathname.includes("/account-information")) {
        return [
          { label: "Setting", href: "/agent/settings" },
          { label: "Account Information", href: undefined },
        ];
      }
      if (pathname.includes("/change-password")) {
        return [
          { label: "Setting", href: "/agent/settings" },
          { label: "Change Password", href: undefined },
        ];
      }
      if (pathname.includes("/notifications")) {
        if (pathname.includes("/notifications/settings")) {
          return [
            { label: "Setting", href: "/agent/settings" },
            { label: "Notifications settings", href: undefined },
          ];
        }
        return [
          { label: "Setting", href: "/agent/settings" },
          { label: "Notification", href: undefined },
        ];
      }
      if (pathname.includes("/account-security")) {
        if (pathname.includes("/set-security-question")) {
          return [
            { label: "Setting", href: "/agent/settings" },
            { label: "Set security question", href: undefined },
          ];
        }
        if (pathname.includes("/verify-security-question")) {
          return [
            { label: "Setting", href: "/agent/settings" },
            { label: "Account Security", href: "/agent/settings/account-security" },
            { label: "Security Verification", href: undefined },
          ];
        }
        return [
          { label: "Setting", href: "/agent/settings" },
          { label: "Account Security", href: undefined },
        ];
      }
    }
    return undefined;
  };

  return (
    <AppShell
      layout={isMobile ? undefined : "alt"}
      header={{ height: HEADER_HEIGHT }}
      navbar={{
        width: isMobile ? 256 : collapsed ? 80 : 256,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened },
      }}
      padding={0}
      style={{
        minHeight: "100vh",
      }}
    >
      <AppShell.Navbar style={{ zIndex: 50 }}>
        <AgentSidebar
          collapsed={isMobile ? false : collapsed}
          onCollapse={toggleCollapsed}
          onNavigate={closeMobile}
        />
      </AppShell.Navbar>

      <AppShell.Header
        style={{
          marginLeft: isMobile ? 0 : collapsed ? "80px" : "256px",
          transition: "margin-left 0.3s ease",
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 100,
        }}
      >
        <AgentHeader
          collapsed={collapsed}
          title={getBreadcrumbs() ? undefined : getPageTitle()}
          setCollapsed={toggleCollapsed}
          toggleMobile={toggleMobile}
          breadcrumbs={getBreadcrumbs()}
          transactionTitle={getBreadcrumbs() ? getPageTitle() : undefined}
        />
      </AppShell.Header>

      <AppShell.Main
        style={{
          backgroundColor: "#F7F7F7",
          minHeight: "100vh",
          padding: "1.5rem",
          marginLeft: isMobile ? 0 : collapsed ? "80px" : "256px",
          paddingTop: `calc(${HEADER_HEIGHT}px + 1.5rem)`,
          transition: "margin-left 0.3s ease",
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

export default function AgentLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AgentLayoutShellContent>{children}</AgentLayoutShellContent>;
}
