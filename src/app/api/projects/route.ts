import { db } from "~/server/db";

export async function GET() {
  try {
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "set" : "not set");
    const projects = await db.query.projects.findMany();
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