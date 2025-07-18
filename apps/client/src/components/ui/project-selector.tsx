import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "./skeleton";
import { useGetSession } from "@/services/session/query";
import { useGetProjects } from "@/services/projects/query";
import { useSetActiveProject } from "@/services/projects/mutations";
import type { Project } from "@/services/projects/service";

interface ProjectSelectorProps {
  onCreateProject: () => void;
}

export function ProjectSelector({ onCreateProject }: ProjectSelectorProps) {
  const { t } = useTranslation();
  const {
    data: session,
    isLoading: sessionLoading,
    isFetching: sessionFetching,
  } = useGetSession();
  const {
    data: projects,
    isLoading: projectsLoading,
    isFetching: projectsFetching,
  } = useGetProjects();
  const { mutate: setActiveProjectMutation, isPending: isSettingProject } =
    useSetActiveProject();

  const handleProjectChange = useCallback(
    (project: Project) => {
      setActiveProjectMutation({ projectId: project.id });
    },
    [setActiveProjectMutation]
  );

  const activeProjectId = useMemo(
    () => session?.session?.activeProjectId,
    [session?.session?.activeProjectId]
  );

  const currentProject = useMemo(
    () =>
      activeProjectId && projects
        ? projects.find((p) => p.id === activeProjectId)
        : null,
    [activeProjectId, projects]
  );

  const displayedProject = useMemo(
    () =>
      currentProject || (projects && projects.length > 0 ? projects[0] : null),
    [currentProject, projects]
  );

  const isLoading = useMemo(
    () =>
      projectsLoading ||
      projectsFetching ||
      isSettingProject ||
      sessionLoading ||
      sessionFetching,
    [
      projectsLoading,
      projectsFetching,
      isSettingProject,
      sessionLoading,
      sessionFetching,
    ]
  );

  const isEmpty = useMemo(() => !projects || projects.length === 0, [projects]);

  const skeletonContent = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <Skeleton className="size-4" />
        <Skeleton className="h-3 w-16" />
      </div>
    ),
    []
  );

  const emptyContent = useMemo(
    () => (
      <>
        <Plus className="w-4 h-4" />
        <span className="font-semibold text-sm">
          {t("projects.createProject")}
        </span>
      </>
    ),
    [t]
  );

  const activeProjectContent = useMemo(
    () => (
      <>
        <span className="font-semibold text-sm">{displayedProject?.name}</span>
        <ChevronsUpDown className="size-3" />
      </>
    ),
    [displayedProject?.name]
  );

  const skeletonDropdownContent = useMemo(
    () => (
      <div className="p-2 space-y-2">
        <Skeleton className="h-4 w-16" />
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2 p-2">
            <Skeleton className="size-4" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    ),
    []
  );

  const projectsList = useMemo(
    () =>
      projects?.map((project: Project) => (
        <DropdownMenuItem
          key={project.id}
          onClick={() => handleProjectChange(project)}
          className="gap-2 p-2 "
        >
          <div className="flex flex-col min-w-0">
            <span className="truncate">{project.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {project.id}
            </span>
          </div>
        </DropdownMenuItem>
      )),
    [projects, handleProjectChange]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-2 justify-start gap-2">
          {isLoading
            ? skeletonContent
            : isEmpty
            ? emptyContent
            : activeProjectContent}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto min-w-48" align="start">
        {isLoading ? (
          skeletonDropdownContent
        ) : isEmpty ? (
          <DropdownMenuItem className="gap-2 p-2" onClick={onCreateProject}>
            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
              <Plus className="size-4" />
            </div>
            <div className="font-medium text-muted-foreground">
              {t("projects.createProject")}
            </div>
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {t("projects.projects")}
            </DropdownMenuLabel>
            {projectsList}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" onClick={onCreateProject}>
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                {t("projects.createProject")}
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
