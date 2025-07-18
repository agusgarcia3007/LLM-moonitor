import { useQuery } from "@tanstack/react-query";
import { ProjectService } from "./service";

export const useGetProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: ProjectService.getProjects,
  });
};

export const useGetProjectById = (projectId: string) => {
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => ProjectService.getProjectById(projectId),
    enabled: !!projectId,
  });
};
