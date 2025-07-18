import { HonoApp } from "@/types";
import { Hono } from "hono";
import { analyticsRouter } from "./analytics";
import { llmEventsRouter } from "./llm-events";
import { stripeRouter } from "./stripe";
import { projectsRouter } from "./projects";

interface RouteObject {
  path: string;
  handler: Hono<HonoApp>;
}

export const ROUTES: RouteObject[] = [
  {
    path: "/llm-events",
    handler: llmEventsRouter,
  },
  {
    path: "/analytics",
    handler: analyticsRouter,
  },
  {
    path: "/stripe",
    handler: stripeRouter,
  },
  {
    path: "/projects",
    handler: projectsRouter,
  },
];
