import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "@tanstack/react-router";

export function DashboardLayout() {
  return (
    <div>
      <SidebarProvider>
        <SidebarInset>
          <div className="p-4">
            <h1>Basic Dashboard with Sidebar</h1>
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
