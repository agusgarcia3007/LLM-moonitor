import { Outlet } from "@tanstack/react-router";

export function DashboardLayout() {
  return (
    <div>
      <h1>Basic Dashboard</h1>
      <Outlet />
    </div>
  );
}
