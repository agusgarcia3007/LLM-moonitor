import { useState } from "react";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import { OrgSelector } from "./org-selector";
import { ProjectSelector } from "./project-selector";
import { Separator } from "./separator";

type Organization = { id: string; name: string; logo?: string | null };

export function ProjectOrgSelector() {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleEditOrg = (org: Organization) => {
    console.log("Edit organization not implemented:", org);
  };

  const handleDeleteOrg = (org: Organization) => {
    console.log("Delete organization not implemented:", org);
  };

  return (
    <div className="flex items-center gap-2">
      <OrgSelector
        onCreateProject={() => setCreateModalOpen(true)}
        onEditOrg={handleEditOrg}
        onDeleteOrg={handleDeleteOrg}
      />

      <Separator orientation="vertical" className="h-4" />

      <ProjectSelector onCreateProject={() => setCreateModalOpen(true)} />

      <CreateProjectDialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
}
