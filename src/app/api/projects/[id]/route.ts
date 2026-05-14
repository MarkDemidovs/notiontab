import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { projects, profiles, projectRolesNeeded } from "~/server/db/schema";
import { eq, or, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const { userId } = await auth();

  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const projectId = parseInt(pathSegments[pathSegments.length - 1] ?? "");
    if (isNaN(projectId)) {
      return Response.json({ error: "Invalid project ID" }, { status: 400 });
    }

    const baseQuery = db
      .select({
        id: projects.id,
        clerkUserId: projects.clerkUserId,
        name: projects.name,
        description: projects.description,
        isPublic: projects.isPublic,
        tags: projects.tags,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        userFullName: profiles.fullName,
        rolesNeededCount: sql<number>`count(${projectRolesNeeded.id})`,
      })
      .from(projects)
      .leftJoin(profiles, eq(projects.clerkUserId, profiles.clerkUserId))
      .leftJoin(projectRolesNeeded, eq(projects.id, projectRolesNeeded.projectId))
      .where(eq(projects.id, projectId))
      .groupBy(projects.id, profiles.fullName);

    const projectData = await baseQuery;

    if (projectData.length === 0) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projectData[0];

    // Check if user can access this project
    if (!project.isPublic && project.clerkUserId !== userId) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    return Response.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}