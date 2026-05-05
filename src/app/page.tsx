"use client";

import { useEffect, useState } from "react";

interface Project {
  id: number;
  clerkUserId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/projects")
      .then((res) => res.json())
      .then((data: Project[]) => setProjects(data))
      .finally(() => setLoading(false));
  }, []);

  // Inside your HomePage component
  const createProject = async () => {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "My New Project",
        description: "Optional description",
      }),
    });

    if (response.ok) {
      const newProject = await response.json();
      setProjects((prev) => [...prev, newProject]);
    } else {
      const errorData = await response.json();
      console.error("Failed to create project:", errorData.error);
    }
  };



  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div>notiontab</div>
      {loading ? <p>Loading...</p> : <p>{projects.length} projects</p>}
    </main>
  );
}