import Link from "next/link";
import { db } from "~/server/db";

export default async function HomePage() {
  const projects = await db.query.projects.findMany();
  console.log("Projects:", projects);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div>notiontab</div>
    </main>
  );
}
