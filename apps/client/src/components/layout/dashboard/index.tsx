import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "@tanstack/react-router";
import { SiteHeader } from "./site-header";

export function DashboardLayout() {
  return (
    <div>
      <SidebarProvider>
        <SidebarInset>
          <SiteHeader />
          <div className="p-4">
            <h1>Basic Dashboard with Sidebar + Header</h1>
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
