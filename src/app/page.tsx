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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="space-y-6">
        <div>notiontab</div>
        
        <div className="flex items-center gap-4">
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

        {loading ? <p>Loading...</p> : <p>{projects.length} projects</p>}
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          + Create Project
        </button>
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onProjectCreated={handleProjectCreated}
      />
    </main>
  );
}