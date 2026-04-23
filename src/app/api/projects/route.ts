import { db } from "~/server/db";

export async function GET() {
  const projects = await db.query.projects.findMany();
  return Response.json(projects);
}