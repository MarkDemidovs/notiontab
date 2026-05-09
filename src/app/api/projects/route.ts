import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { projects } from "~/server/db/schema";
import { eq, or } from "drizzle-orm";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") ?? "public";

    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "set" : "not set");
    
    let projectsData;
    if (mode === "own") {
      // Only user's own projects
      projectsData = await db.query.projects.findMany({
        where: (p) => eq(p.clerkUserId, userId),
      });
    } else {
      // Public projects + user's own projects
      projectsData = await db.query.projects.findMany({
        where: (p) => or(eq(p.isPublic, true), eq(p.clerkUserId, userId)),
      });
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

    return Response.json(newProject, { status: 201 });
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