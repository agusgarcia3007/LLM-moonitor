import { IconBriefcase, IconPlus } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProjects } from "@/services/projects/query";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";

export const Route = createFileRoute("/_dashboard/projects/")({
  component: ProjectsIndexPage,
});

function ProjectsIndexPage() {
  const { t } = useTranslation();
  const { data: projects, isLoading: isLoadingList } = useGetProjects();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("projects.title")}
          </h1>
          <p className="text-muted-foreground">{t("projects.description")}</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <IconPlus className="h-4 w-4" />
          {t("projects.createProject")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoadingList ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
              </Card>
            ))}
          </>
        ) : projects && projects.length > 0 ? (
          <>
            {projects.map((project) => (
              <Card key={project.id} className="transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <IconBriefcase className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-sm font-mono">
                        {project.id}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <IconBriefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="text-lg mb-2">
                {t("projects.noProjectsTitle")}
              </CardTitle>
              <CardDescription className="mb-4">
                {t("projects.noProjectsDescription")}
              </CardDescription>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(true)}
              >
                <IconPlus className="h-4 w-4" />
                {t("projects.createFirstProject")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
