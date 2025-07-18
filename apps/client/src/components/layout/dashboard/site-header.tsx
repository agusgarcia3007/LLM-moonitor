import { ProjectOrgSelector } from "@/components/ui/project-org-selector";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitch } from "../theme-switch";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-full" />
        <ProjectOrgSelector />
      </div>
      <div className="flex items-center gap-2 px-4">
        <ThemeSwitch />
      </div>
    </header>
  );
}
