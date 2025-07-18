import { Context } from "hono";
import { LogLlmEventSchema } from "../schemas/llm-events";
import { db } from "@/db";
import {
  llm_event,
  global_stats,
  type LLMEventMetadata,
  project,
  member,
} from "@/db/schema";
import {
  parseQueryParams,
  createSortHelpers,
  parseEventFilters,
  buildEventWhereConditions,
} from "@/lib/query-params";
import { desc, asc, eq, count, and, sql } from "drizzle-orm";
import { SORT_ORDER } from "@/lib/endpoint-builder";
import { calculateCostFromCache } from "@/lib/cost-calculator";
import { resolveProjectId } from "@/lib/resolve-project";
import { getActiveProject } from "@/lib/utils";

const SORTABLE_FIELDS = [
  "created_at",
  "model",
  "provider",
  "status",
  "latency_ms",
  "cost_usd",
  "score",
] as const;

const { allowedSortFields, sortFieldMap } = createSortHelpers(
  llm_event,
  SORTABLE_FIELDS
);

export const logEvent = async (c: Context) => {
  const body = await c.req.json();
  const session = await c.get("session");
  const data = LogLlmEventSchema.parse(body);
  const apiKey = c.req.header("x-api-key");

  const projectId = await resolveProjectId(
    { projectId: body.projectId, organizationId: body.organizationId },
    session,
    getActiveProject
  );

  if (!projectId) {
    console.warn(
      "[logEvent] Missing projectId and unable to resolve default project"
    );
    return c.json(
      {
        success: false,
        message: "projectId is required",
      },
      200
    );
  }

  if (session && session.userId) {
    const projectWithOrg = await db
      .select({ organizationId: project.organizationId })
      .from(project)
      .where(eq(project.id, projectId))
      .limit(1);

    if (!projectWithOrg.length) {
      return c.json(
        {
          success: false,
          message: "Project not found",
        },
        404
      );
    }

    const userMember = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.userId),
          eq(member.organizationId, projectWithOrg[0].organizationId)
        )
      );

    if (!userMember.length) {
      return c.json(
        {
          success: false,
          message: "User is not a member of this project's organization",
        },
        403
      );
    }
  }

  const calculatedCost = calculateCostFromCache(
    data.provider,
    data.model,
    data.prompt_tokens || 0,
    data.completion_tokens || 0
  );

  const metadata: LLMEventMetadata = {
    ...(data.metadata || {}),
    apiKey,
  };

  const projectData = await db
    .select({ organizationId: project.organizationId })
    .from(project)
    .where(eq(project.id, projectId))
    .limit(1);

  if (!projectData.length) {
    return c.json(
      {
        success: false,
        message: "Project not found",
      },
      404
    );
  }

  const insert = await db.insert(llm_event).values({
    id: crypto.randomUUID(),
    ...data,
    cost_usd: calculatedCost,
    organization_id: projectData[0].organizationId,
    project_id: projectId,
    metadata,
  });

  await db
    .update(global_stats)
    .set({
      total_events: sql`total_events + 1`,
      updated_at: new Date(),
    })
    .where(sql`id = 1`);

  return c.json({
    success: true,
    message: "LLM event logged successfully",
    data: insert,
  });
};

export const getEvents = async (c: Context) => {
  const session = await c.get("session");

  if (!session.activeOrganizationId) {
    return c.json(
      {
        success: false,
        message: "No active organization found",
      },
      400
    );
  }

  const activeProject = await getActiveProject(session.userId);
  if (!activeProject) {
    return c.json(
      {
        success: false,
        message: "No active project found",
      },
      400
    );
  }

  const { limit, offset, sort, order } = parseQueryParams(
    c,
    allowedSortFields as unknown as string[]
  );

  const apiKey = c.req.query("apiKey");
  const filters = parseEventFilters(c);
  const projectId = activeProject.id;

  const orderBy =
    order === SORT_ORDER.ASC
      ? asc(sortFieldMap[sort as keyof typeof sortFieldMap])
      : desc(sortFieldMap[sort as keyof typeof sortFieldMap]);

  const whereConditions = buildEventWhereConditions({
    projectId,
    apiKey,
    filters,
  });

  try {
    const [events, countResult] = await Promise.all([
      db
        .select()
        .from(llm_event)
        .where(and(...whereConditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(llm_event)
        .where(and(...whereConditions)),
    ]);

    const total = countResult[0]?.count ?? 0;

    return c.json({
      success: true,
      data: events,
      pagination: {
        total: Number(total),
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch events",
      },
      500
    );
  }
};
