import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { projects } from "~/server/db/schema";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "set" : "not set");
    const projects = await db.query.projects.findMany({
      where: (p, { eq }) => eq(p.clerkUserId, userId),
    });
    return Response.json(projects);
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