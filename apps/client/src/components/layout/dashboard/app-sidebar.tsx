import * as React from "react";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();

  // Use getSession instead of useSession hook
  const [session, setSession] = React.useState<{
    user?: { email: string; name?: string };
  } | null>(null);
  const [isPending, setIsPending] = React.useState(true);

  React.useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        // @ts-expect-error - temporary fix for session type mismatch
        setSession(sessionData);
      } catch (error) {
        console.error("Error fetching session:", error);
        setSession(null);
      } finally {
        setIsPending(false);
      }
    };

    fetchSession();
  }, []);

  return (
    <Sidebar {...props}>
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
                  className={cn(
                    "transition-all dark:invert duration-300",
                    !open ? "!size-5" : "!size-7"
                  )}
                />
                <span className="text-base font-semibold">LLMonitor</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-4">Basic Content</div>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground">
          {isPending
            ? "Loading..."
            : session?.user
            ? `User: ${session.user.email}`
            : "Not signed in"}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
