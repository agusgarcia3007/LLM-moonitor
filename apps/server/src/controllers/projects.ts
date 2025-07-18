import { Context } from "hono";
import { db } from "@/db";
import { project, member, user, session } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const CreateProjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  organizationId: z.string(),
});

const UpdateProjectSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
});

const SetActiveProjectSchema = z.object({
  projectId: z.string(),
});

export const getProjects = async (c: Context) => {
  const session = await c.get("session");

  if (!session?.activeOrganizationId) {
    return c.json(
      {
        success: false,
        message: "No active organization found",
      },
      400
    );
  }

  try {
    const userMember = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.userId),
          eq(member.organizationId, session.activeOrganizationId)
        )
      );

    if (!userMember.length) {
      return c.json(
        {
          success: false,
          message: "User is not a member of this organization",
        },
        403
      );
    }

    const projects = await db
      .select({
        id: project.id,
        name: project.name,
        organizationId: project.organizationId,
        createdBy: project.createdBy,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })
      .from(project)
      .where(eq(project.organizationId, session.activeOrganizationId));

    return c.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch projects",
      },
      500
    );
  }
};

export const getProjectById = async (c: Context) => {
  const session = await c.get("session");
  const projectId = c.req.param("id");

  if (!projectId) {
    return c.json(
      {
        success: false,
        message: "Project ID is required",
      },
      400
    );
  }

  try {
    const projectData = await db
      .select({
        id: project.id,
        name: project.name,
        organizationId: project.organizationId,
        createdBy: project.createdBy,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })
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

    const userMember = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.userId),
          eq(member.organizationId, projectData[0].organizationId)
        )
      );

    if (!userMember.length) {
      return c.json(
        {
          success: false,
          message: "Access denied",
        },
        403
      );
    }

    return c.json({
      success: true,
      data: projectData[0],
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch project",
      },
      500
    );
  }
};

export const createProject = async (c: Context) => {
  const session = await c.get("session");
  const body = await c.req.json();
  const data = CreateProjectSchema.parse(body);

  try {
    const userMember = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.userId),
          eq(member.organizationId, data.organizationId)
        )
      );

    if (!userMember.length) {
      return c.json(
        {
          success: false,
          message: "User is not a member of this organization",
        },
        403
      );
    }

    const newProject = await db
      .insert(project)
      .values({
        id: crypto.randomUUID(),
        name: data.name,
        organizationId: data.organizationId,
        createdBy: session.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return c.json({
      success: true,
      data: newProject[0],
      message: "Project created successfully",
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return c.json(
      {
        success: false,
        message: "Failed to create project",
      },
      500
    );
  }
};

export const updateProject = async (c: Context) => {
  const session = await c.get("session");
  const projectId = c.req.param("id");
  const body = await c.req.json();
  const data = UpdateProjectSchema.parse(body);

  if (!projectId) {
    return c.json(
      {
        success: false,
        message: "Project ID is required",
      },
      400
    );
  }

  try {
    const projectData = await db
      .select({
        organizationId: project.organizationId,
      })
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

    const userMember = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.userId),
          eq(member.organizationId, projectData[0].organizationId)
        )
      );

    if (!userMember.length) {
      return c.json(
        {
          success: false,
          message: "Access denied",
        },
        403
      );
    }

    const updatedProject = await db
      .update(project)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(project.id, projectId))
      .returning();

    return c.json({
      success: true,
      data: updatedProject[0],
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return c.json(
      {
        success: false,
        message: "Failed to update project",
      },
      500
    );
  }
};

export const deleteProject = async (c: Context) => {
  const session = await c.get("session");
  const projectId = c.req.param("id");

  if (!projectId) {
    return c.json(
      {
        success: false,
        message: "Project ID is required",
      },
      400
    );
  }

  try {
    const projectData = await db
      .select({
        organizationId: project.organizationId,
      })
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

    const userMember = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.userId),
          eq(member.organizationId, projectData[0].organizationId)
        )
      );

    if (!userMember.length) {
      return c.json(
        {
          success: false,
          message: "Access denied",
        },
        403
      );
    }

    await db.delete(project).where(eq(project.id, projectId));

    return c.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return c.json(
      {
        success: false,
        message: "Failed to delete project",
      },
      500
    );
  }
};

export const setActiveProject = async (c: Context) => {
  const sessionData = await c.get("session");
  const body = await c.req.json();
  const data = SetActiveProjectSchema.parse(body);

  try {
    // Single query to validate project exists and user has access
    const projectAccess = await db
      .select({
        projectId: project.id,
        projectName: project.name,
        organizationId: project.organizationId,
        memberExists: member.id,
      })
      .from(project)
      .innerJoin(
        member,
        and(
          eq(member.organizationId, project.organizationId),
          eq(member.userId, sessionData.userId)
        )
      )
      .where(eq(project.id, data.projectId))
      .limit(1);

    if (!projectAccess.length) {
      return c.json(
        {
          success: false,
          message: "Project not found or access denied",
        },
        404
      );
    }

    // Parallel updates for better performance
    await Promise.all([
      db
        .update(user)
        .set({ lastActiveProjectId: data.projectId })
        .where(eq(user.id, sessionData.userId)),
      db
        .update(session)
        .set({ activeProjectId: data.projectId })
        .where(eq(session.id, sessionData.id)),
    ]);

    return c.json({
      success: true,
      message: "Active project updated successfully",
      data: {
        projectId: data.projectId,
        projectName: projectAccess[0].projectName,
      },
    });
  } catch (error) {
    console.error("Error setting active project:", error);
    return c.json(
      {
        success: false,
        message: "Failed to set active project",
      },
      500
    );
  }
};
