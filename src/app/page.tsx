"use client";

import { useEffect, useState } from "react";
import CreateProjectModal from "./CreateProjectModal";

interface Project {
  id: number;
  clerkUserId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublicMode, setIsPublicMode] = useState(true);

  useEffect(() => {
    void fetch(`/api/projects?mode=${isPublicMode ? "public" : "own"}`)
      .then((res) => res.json())
      .then((data: Project[]) => setProjects(data))
      .finally(() => setLoading(false));
  }, [isPublicMode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "true") {
      setIsModalOpen(true);
    }

    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener("openCreateProjectModal", handleOpenModal);

    return () => {
      window.removeEventListener("openCreateProjectModal", handleOpenModal);
    };
  }, []);

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [...prev, newProject]);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Clean up the URL
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("create");
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">notiontab</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            + Create Project
          </button>
        </div>

        <div className="mb-8 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={isPublicMode ? "text-white" : "text-slate-400"}>Public</span>
            <button
              onClick={() => setIsPublicMode(!isPublicMode)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                isPublicMode ? "bg-slate-600" : "bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isPublicMode ? "translate-x-1" : "translate-x-7"
                }`}
              />
            </button>
            <span className={!isPublicMode ? "text-white" : "text-slate-400"}>Own</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-400">No projects found</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col rounded-lg border border-slate-700 bg-slate-900/50 p-6 hover:border-slate-600 hover:bg-slate-900/70 transition-all cursor-pointer"
              >
                <h2 className="mb-2 text-lg font-semibold text-white">{project.name}</h2>
                {project.description && (
                  <p className="mb-4 flex-1 text-sm text-slate-300">{project.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className={`rounded px-2 py-1 ${project.isPublic ? "bg-slate-700" : "bg-slate-800"}`}>
                    {project.isPublic ? "Public" : "Private"}
                  </span>
                  <span className="text-slate-500">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onProjectCreated={handleProjectCreated}
      />
    </main>
  );
}