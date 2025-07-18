import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  setActiveProject,
} from "@/controllers/projects";
import { endpointBuilder, HttpMethod } from "@/lib/endpoint-builder";
import { HonoApp } from "@/types";
import { Hono } from "hono";

const projectsRouter = new Hono<HonoApp>();

endpointBuilder({
  path: "/",
  method: HttpMethod.GET,
  body: getProjects,
  isPrivate: true,
  requiresSubscription: true,
})(projectsRouter);

endpointBuilder({
  path: "/:id",
  method: HttpMethod.GET,
  body: getProjectById,
  isPrivate: true,
  requiresSubscription: true,
})(projectsRouter);

endpointBuilder({
  path: "/",
  method: HttpMethod.POST,
  body: createProject,
  isPrivate: true,
  requiresSubscription: true,
})(projectsRouter);

endpointBuilder({
  path: "/:id",
  method: HttpMethod.PUT,
  body: updateProject,
  isPrivate: true,
  requiresSubscription: true,
})(projectsRouter);

endpointBuilder({
  path: "/:id",
  method: HttpMethod.DELETE,
  body: deleteProject,
  isPrivate: true,
  requiresSubscription: true,
})(projectsRouter);

endpointBuilder({
  path: "/set-active",
  method: HttpMethod.POST,
  body: setActiveProject,
  isPrivate: true,
  requiresSubscription: true,
})(projectsRouter);

export { projectsRouter };
