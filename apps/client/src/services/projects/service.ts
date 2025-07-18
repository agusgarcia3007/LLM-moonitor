import { http } from "@/lib/http";

export interface Project {
  id: string;
  name: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectParams {
  name: string;
  organizationId: string;
}

export interface UpdateProjectParams {
  name?: string;
}

export interface SetActiveProjectParams {
  projectId: string;
}

export class ProjectService {
  public static async getProjects() {
    const { data } = await http.get("/projects");
    return data.data as Project[];
  }

  public static async getProjectById(projectId: string) {
    const { data } = await http.get(`/projects/${projectId}`);
    return data.data as Project;
  }

  public static async createProject(params: CreateProjectParams) {
    const { data } = await http.post("/projects", params);
    return data.data as Project;
  }

  public static async updateProject(
    projectId: string,
    params: UpdateProjectParams
  ) {
    const { data } = await http.put(`/projects/${projectId}`, params);
    return data.data as Project;
  }

  public static async deleteProject(projectId: string) {
    const { data } = await http.delete(`/projects/${projectId}`);
    return data;
  }

  public static async setActiveProject(params: SetActiveProjectParams) {
    const { data } = await http.post("/projects/set-active", params);
    return data;
  }
}
