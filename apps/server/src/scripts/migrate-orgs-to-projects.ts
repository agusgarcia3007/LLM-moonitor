import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";

async function migrateOrgsToProjects() {
  console.log("🚀 Starting organization → project migration...");

  try {
    // Step 1: Get all current organizations and their owners
    const currentOrgs = await db
      .select({
        orgId: schema.organization.id,
        orgName: schema.organization.name,
        orgCreatedAt: schema.organization.createdAt,
        orgMetadata: schema.organization.metadata,
        ownerId: schema.member.userId,
        ownerName: schema.user.name,
        ownerEmail: schema.user.email,
      })
      .from(schema.organization)
      .leftJoin(
        schema.member,
        and(
          eq(schema.member.organizationId, schema.organization.id),
          eq(schema.member.role, "owner")
        )
      )
      .leftJoin(schema.user, eq(schema.user.id, schema.member.userId));

    console.log(`📊 Found ${currentOrgs.length} organizations to migrate`);

    // Step 2: Separate organizations with and without owners
    const orgsWithOwners = currentOrgs.filter((org) => org.ownerId !== null);
    const orgsWithoutOwners = currentOrgs.filter((org) => org.ownerId === null);

    console.log(`👥 Organizations with owners: ${orgsWithOwners.length}`);
    console.log(
      `⚠️  Organizations without owners: ${orgsWithoutOwners.length}`
    );

    // Step 3: Handle organizations without owners first
    if (orgsWithoutOwners.length > 0) {
      console.log("🔧 Creating default organization for orphaned projects...");

      // Find an admin user to assign as creator for orphaned projects
      const adminUsers = await db
        .select({ id: schema.user.id })
        .from(schema.user)
        .where(eq(schema.user.role, "admin"))
        .limit(1);

      // If no admin user exists, find any user
      let creatorUserId: string;
      if (adminUsers.length > 0) {
        creatorUserId = adminUsers[0].id;
      } else {
        const anyUsers = await db
          .select({ id: schema.user.id })
          .from(schema.user)
          .limit(1);

        if (anyUsers.length === 0) {
          throw new Error(
            "No users found in database. Cannot create orphaned projects without a creator."
          );
        }

        creatorUserId = anyUsers[0].id;
      }

      // Create a default organization for orphaned projects
      const defaultOrgId = randomUUID();
      const defaultOrgName = "Default Organization (Orphaned Projects)";

      await db.insert(schema.organization).values({
        id: defaultOrgId,
        name: defaultOrgName,
        createdAt: new Date(),
      });

      // Convert orphaned organizations to projects under default org
      for (const orphanOrg of orgsWithoutOwners) {
        console.log(
          `📁 Converting orphaned org "${orphanOrg.orgName}" → project (keeping ID: ${orphanOrg.orgId})`
        );

        await db.insert(schema.project).values({
          id: orphanOrg.orgId, // Keep same ID for SDK compatibility
          name: orphanOrg.orgName,
          organizationId: defaultOrgId,
          createdBy: creatorUserId, // Use valid user ID
          createdAt: orphanOrg.orgCreatedAt,
          updatedAt: orphanOrg.orgCreatedAt,
        });

        // Update LLM events to use project_id
        await db
          .update(schema.llm_event)
          .set({ project_id: orphanOrg.orgId })
          .where(eq(schema.llm_event.organization_id, orphanOrg.orgId));

        console.log(
          `📝 Updated LLM events for orphaned project ${orphanOrg.orgId}`
        );

        // Delete old organization record
        await db
          .delete(schema.organization)
          .where(eq(schema.organization.id, orphanOrg.orgId));
      }
    }

    // Step 4: Group organizations with owners by owner to create real organizations
    const orgsByOwner = new Map<string, typeof orgsWithOwners>();

    for (const org of orgsWithOwners) {
      const key = org.ownerId!; // We know it's not null here
      if (!orgsByOwner.has(key)) {
        orgsByOwner.set(key, []);
      }
      orgsByOwner.get(key)!.push(org);
    }

    console.log(`👥 Found ${orgsByOwner.size} unique users with organizations`);

    // Step 5: Create real organizations and migrate projects
    for (const [ownerId, userOrgs] of Array.from(orgsByOwner.entries())) {
      const owner = userOrgs[0]; // Get owner info from first org

      // Create real organization for this user
      const realOrgId = randomUUID();
      const realOrgName = `${
        owner.ownerName || owner.ownerEmail!.split("@")[0]
      }-${ownerId.slice(0, 8)} Org`;

      console.log(`🏢 Creating real organization: ${realOrgName}`);

      // Insert the real organization
      await db.insert(schema.organization).values({
        id: realOrgId,
        name: realOrgName,
        createdAt: new Date(),
      });

      // Create membership for the owner in the real organization
      await db.insert(schema.member).values({
        id: randomUUID(),
        userId: ownerId,
        organizationId: realOrgId,
        role: "owner",
        createdAt: new Date(),
      });

      // Update user's lastActiveOrganizationId to the real organization
      await db
        .update(schema.user)
        .set({ lastActiveOrganizationId: realOrgId })
        .where(eq(schema.user.id, ownerId));

      // Step 6: Convert each old organization to a project
      for (const oldOrg of userOrgs) {
        console.log(
          `📁 Converting org "${oldOrg.orgName}" → project (keeping ID: ${oldOrg.orgId})`
        );

        // Create project with SAME ID as old organization (SDK compatibility!)
        await db.insert(schema.project).values({
          id: oldOrg.orgId, // 🔑 CRITICAL: Keep same ID for SDK compatibility
          name: oldOrg.orgName,
          organizationId: realOrgId, // Points to the new real organization
          createdBy: ownerId,
          createdAt: oldOrg.orgCreatedAt,
          updatedAt: oldOrg.orgCreatedAt,
        });

        // Update LLM events to use project_id instead of organization_id
        const updateResult = await db
          .update(schema.llm_event)
          .set({ project_id: oldOrg.orgId }) // Same ID as before
          .where(eq(schema.llm_event.organization_id, oldOrg.orgId));

        console.log(`📝 Updated LLM events for project ${oldOrg.orgId}`);

        // Migrate other members to the real organization
        const otherMembers = await db
          .select()
          .from(schema.member)
          .where(
            and(
              eq(schema.member.organizationId, oldOrg.orgId),
              eq(schema.member.role, "member") // Non-owners
            )
          );

        for (const member of otherMembers) {
          // Check if member is already in the real org
          const existingMembership = await db
            .select()
            .from(schema.member)
            .where(
              and(
                eq(schema.member.userId, member.userId),
                eq(schema.member.organizationId, realOrgId)
              )
            );

          if (existingMembership.length === 0) {
            // Add member to real organization
            await db.insert(schema.member).values({
              id: randomUUID(),
              userId: member.userId,
              organizationId: realOrgId,
              role: member.role,
              createdAt: new Date(),
            });
          }
        }
      }

      // Step 7: Clean up old organization entries (but keep the IDs as projects!)
      for (const oldOrg of userOrgs) {
        // Delete old memberships
        await db
          .delete(schema.member)
          .where(eq(schema.member.organizationId, oldOrg.orgId));

        // Delete old organization record (the ID now exists as a project)
        await db
          .delete(schema.organization)
          .where(eq(schema.organization.id, oldOrg.orgId));
      }

      console.log(`✅ Completed migration for user ${owner.ownerEmail}`);
    }

    console.log("🎉 Migration completed successfully!");
    console.log("📋 Summary:");
    console.log(`   • Created ${orgsByOwner.size} real organizations`);
    console.log(
      `   • Migrated ${orgsWithOwners.length} organizations → projects`
    );
    console.log(
      `   • Handled ${orgsWithoutOwners.length} orphaned organizations`
    );
    console.log(`   • Project IDs preserved for SDK compatibility`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Export for use as module
export { migrateOrgsToProjects };

// Run migration if this file is executed directly
const isMainModule = typeof require !== "undefined" && require.main === module;
const isDirectExecution = process.argv[1]?.includes("migrate-orgs-to-projects");

if (isMainModule || isDirectExecution) {
  migrateOrgsToProjects()
    .then(() => {
      console.log("✅ Migration script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration script failed:", error);
      process.exit(1);
    });
}
