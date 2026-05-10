import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { projects, profiles } from "~/server/db/schema";
import { eq, or } from "drizzle-orm";

export async function GET(request: Request) {
  const { userId } = await auth();

  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") ?? "public";

    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "set" : "not set");
    
    const baseQuery = db
      .select({
        id: projects.id,
        clerkUserId: projects.clerkUserId,
        name: projects.name,
        description: projects.description,
        isPublic: projects.isPublic,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        userFullName: profiles.fullName,
      })
      .from(projects)
      .leftJoin(profiles, eq(projects.clerkUserId, profiles.clerkUserId));

    let projectsData;
    if (mode === "own") {
      if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      projectsData = await baseQuery.where(() => eq(projects.clerkUserId, userId));
    } else if (userId) {
      projectsData = await baseQuery.where(() => or(eq(projects.isPublic, true), eq(projects.clerkUserId, userId)));
    } else {
      projectsData = await baseQuery.where(() => eq(projects.isPublic, true));
    }
    
    return Response.json(projectsData);
  } catch (error) {
    console.error("Full error:", error);
    return Response.json(
      { 
        error: String(error),
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    const [newProject] = await db.insert(projects).values({
      clerkUserId: userId,
      name,
      description,
    }).returning();

    const [profile] = await db
      .select({ fullName: profiles.fullName })
      .from(profiles)
      .where(eq(profiles.clerkUserId, userId));

    return Response.json({
      ...newProject,
      userFullName: profile?.fullName ?? null,
    }, { status: 201 });
  } catch (error) {
    console.error("Full error:", error);
    return Response.json(
      { 
        error: String(error),
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}