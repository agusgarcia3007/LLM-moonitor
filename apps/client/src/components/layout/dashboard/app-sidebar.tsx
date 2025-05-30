import {
  IconBell,
  IconBriefcase,
  IconCurrency,
  IconDashboard,
  IconFileDescription,
  IconHelp,
  // IconFlask,
  IconKey,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import * as React from "react";

import { NavMain } from "@/components/layout/dashboard/nav-main";
import { NavSecondary } from "@/components/layout/dashboard/nav-secondary";
import { NavUser } from "@/components/layout/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending } = authClient.useSession();
  const { t } = useTranslation();

  const user = session?.user
    ? {
        name: session.user.name || session.user.email,
        email: session.user.email,
        avatar: session.user.image || "",
      }
    : null;

  const data = {
    navMain: [
      {
        title: t("navigation.dashboard"),
        url: "/dashboard",
        icon: IconDashboard,
      },
      {
        title: t("navigation.projects"),
        url: "/projects",
        icon: IconBriefcase,
      },
      {
        title: t("navigation.logs"),
        url: "/logs",
        icon: IconFileDescription,
      },
      {
        title: t("navigation.costAnalysis"),
        url: "/cost-analysis",
        icon: IconCurrency,
      },
      {
        title: t("navigation.alerts"),
        url: "/alerts",
        icon: IconBell,
      },
      // {
      //   title: t("navigation.experiments"),
      //   url: "/experiments",
      //   icon: IconFlask,
      //   isComingSoon: true,
      // },
      {
        title: t("navigation.apiKeys"),
        url: "/api-keys",
        icon: IconKey,
      },
    ],
    navSecondary: [
      {
        title: t("navigation.settings"),
        url: "/settings",
        icon: IconSettings,
      },
      {
        title: t("navigation.documentation"),
        url: "/docs",
        icon: IconHelp,
        external: true,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <img
                  src="/logo.svg"
                  alt="LLMonitor"
                  className="!size-5 text-primary"
                />
                <span className="text-base font-semibold">LLMonitor</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {session?.user?.role === "admin" && (
          <SidebarMenu className="mt-4">
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/users">
                  <IconUsers className="mr-2" />
                  <span>{t("navigation.users")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {isPending ? (
          <div className="p-4 text-xs text-muted-foreground">
            Loading user...
          </div>
        ) : user ? (
          <NavUser user={user} />
        ) : (
          <div className="p-4 text-xs text-muted-foreground">Not signed in</div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
