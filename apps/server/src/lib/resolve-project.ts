export type SessionLike = {
  activeOrganizationId?: string | null;
  organizationId?: string | null;
  userId?: string | null;
};

export type GetProjectFn = (userId: string) => Promise<{ id: string } | null>;

export interface ResolveProjectParams {
  projectId?: string;
  organizationId?: string;
}

export async function resolveProjectId(
  body: ResolveProjectParams,
  session: SessionLike | null,
  getActiveProject: GetProjectFn
): Promise<string | undefined> {
  let projectId =
    body.projectId ||
    body.organizationId ||
    session?.activeOrganizationId ||
    session?.organizationId ||
    undefined;

  if (!projectId && session?.userId) {
    const project = await getActiveProject(session.userId);
    projectId = project?.id;
  }

  return projectId || undefined;
}
