import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ProjectService,
  type CreateProjectParams,
  type UpdateProjectParams,
  type SetActiveProjectParams,
} from "./service";
import { catchAxiosError } from "@/lib/catch-axios-error";

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateProjectParams) =>
      ProjectService.createProject(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: catchAxiosError,
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      params,
    }: {
      projectId: string;
      params: UpdateProjectParams;
    }) => ProjectService.updateProject(projectId, params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({
        queryKey: ["projects", variables.projectId],
      });
    },
    onError: catchAxiosError,
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => ProjectService.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: catchAxiosError,
  });
};

export const useSetActiveProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SetActiveProjectParams) =>
      ProjectService.setActiveProject(params),
    onSuccess: () => {
      // Invalidate all project-dependent queries
      queryClient.invalidateQueries({ queryKey: ["llm-events"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["cost-analysis"],
        exact: false,
      });
      // Invalidate session to get updated activeProjectId from customSession plugin
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
};
