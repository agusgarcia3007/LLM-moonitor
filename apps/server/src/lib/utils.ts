import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, inArray, and } from "drizzle-orm";

export async function getActiveOrganization(userId: string) {
  // Busca la organización activa persistida en el usuario
  const userRow = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.id, userId))
    .limit(1);
  const lastActiveOrgId = userRow[0]?.lastActiveOrganizationId;
  if (lastActiveOrgId) {
    const org = await db
      .select()
      .from(schema.organization)
      .where(eq(schema.organization.id, lastActiveOrgId))
      .limit(1);
    if (org[0]) return org[0];
  }
  // Si no hay persistida, busca la primera organización del usuario
  const memberRow = await db
    .select()
    .from(schema.member)
    .where(eq(schema.member.userId, userId))
    .limit(1);
  if (!memberRow.length) return null;
  const org = await db
    .select()
    .from(schema.organization)
    .where(eq(schema.organization.id, memberRow[0].organizationId))
    .limit(1);
  return org[0] ?? null;
}

export async function getActiveProject(userId: string) {
  // Busca el proyecto activo persistido en el usuario
  const userRow = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.id, userId))
    .limit(1);

  const lastActiveProjectId = userRow[0]?.lastActiveProjectId;
  if (lastActiveProjectId) {
    const project = await db
      .select()
      .from(schema.project)
      .where(eq(schema.project.id, lastActiveProjectId))
      .limit(1);
    if (project[0]) return project[0];
  }

  // Si no hay proyecto persistido, busca el primer proyecto de la organización activa
  const activeOrg = await getActiveOrganization(userId);
  if (!activeOrg) return null;

  const project = await db
    .select()
    .from(schema.project)
    .where(eq(schema.project.organizationId, activeOrg.id))
    .limit(1);

  return project[0] ?? null;
}

export async function getActiveSubscription(userId: string) {
  const [sub] = await db
    .select({
      plan: schema.subscription.plan,
      status: schema.subscription.status,
      periodEnd: schema.subscription.periodEnd,
    })
    .from(schema.subscription)
    .where(
      and(
        eq(schema.subscription.referenceId, userId),
        inArray(schema.subscription.status, ["active", "trialing"])
      )
    )
    .limit(1);

  return sub;
}
