"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import CreateProjectModal from "./CreateProjectModal";
import ViewProjectModal from "./ViewProjectModal";

interface Project {
  id: number;
  clerkUserId: string;
  userFullName: string | null;
  name: string;
  description: string | null;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  rolesNeededCount?: number;
}

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublicMode, setIsPublicMode] = useState(true);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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

  const handleToggleMode = () => {
    if (!isPublicMode) {
      // Already in own mode, switch to public
      setIsPublicMode(true);
    } else if (!isSignedIn && isLoaded) {
      // Trying to switch to own mode but not signed in
      setShowSignInPrompt(true);
    } else {
      // Signed in, switch to own mode
      setIsPublicMode(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/40 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Feed</p>
            <h1 className="text-3xl font-semibold text-slate-900">Discover projects</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Browse public projects and switch to your own work when you want a personalized view.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.15-5.15A7 7 0 1110 3a7 7 0 018 8.5z" />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Search projects"
                className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              + Create project
            </button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200/40">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">N</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">notiontab</p>
                  <p className="text-sm text-slate-500">Project discovery made simple</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mode</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{isPublicMode ? "Public feed" : "Your projects"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Projects</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{projects.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200/40">
              <p className="text-sm font-semibold text-slate-900">Why this feed</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Public mode shows the latest open projects. Own mode shows only projects linked to your account.
              </p>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200/40">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Filter</p>
                  <h2 className="text-xl font-semibold text-slate-900">What do you want to see?</h2>
                </div>
                <div className="flex items-center gap-3 rounded-full bg-slate-100 p-2">
                  <button
                    onClick={handleToggleMode}
                    className={`relative inline-flex h-10 w-20 items-center rounded-full p-1 transition ${
                      isPublicMode ? "bg-slate-200" : "bg-blue-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-8 w-8 rounded-full bg-white shadow transition-transform ${
                        isPublicMode ? "translate-x-0" : "translate-x-10"
                      }`}
                    />
                  </button>
                  <span className={isPublicMode ? "text-slate-900" : "text-slate-400"}>Public</span>
                  <span className={!isPublicMode ? "text-slate-900" : "text-slate-400"}>Own</span>
                </div>
              </div>
              {!isPublicMode && !isSignedIn && isLoaded && (
                <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
                  <p>You need to sign in to view your own projects.</p>
                </div>
              )}
            </div>

            {loading ? (
              <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm shadow-slate-200/40">
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm shadow-slate-200/40">
                No projects found.
              </div>
            ) : (
              <div className="space-y-6">
                {projects.map((project) => (
                  <article
                    key={project.id}
                    onClick={() => {
                      setSelectedProject(project);
                      setIsViewModalOpen(true);
                    }}
                    className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40 transition hover:border-slate-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Project</p>
                        <h3 className="mt-2 text-xl font-semibold text-slate-900">{project.name}</h3>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${project.isPublic ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                        {project.isPublic ? "Public" : "Private"}
                      </span>
                    </div>
                    {project.description ? (
                      <p className="mt-4 text-sm leading-7 text-slate-600 line-clamp-3">{project.description}</p>
                    ) : (
                      <p className="mt-4 text-sm leading-7 text-slate-500">No description provided.</p>
                    )}
                    {project.tags && project.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-6 grid gap-3 text-sm text-slate-500 sm:grid-cols-[auto_auto]">
                      <div className="flex flex-wrap items-center gap-3">
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span>{project.userFullName ?? project.clerkUserId}</span>
                      </div>
                      {project.rolesNeededCount ? (
                        <div className="flex items-center justify-start sm:justify-end">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                            {project.rolesNeededCount} role{project.rolesNeededCount > 1 ? "s" : ""} needed
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200/40">
              <p className="text-sm font-semibold text-slate-900">Quick actions</p>
              <div className="mt-4 space-y-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Create a project
                </button>
                <button
                  onClick={() => setIsPublicMode(true)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View public feed
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm shadow-slate-200/40">
              <p className="text-sm font-semibold text-slate-900">Why notiontab</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                This feed helps you discover projects faster and switch to your own work with one tap.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {showSignInPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl shadow-slate-900/10">
            <h2 className="text-xl font-semibold text-slate-900">Sign In Required</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This requires an account and additional info to view your personal projects.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setShowSignInPrompt(false)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <SignInButton>
                <button className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                  Sign in with Clerk
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onProjectCreated={handleProjectCreated}
      />

      <ViewProjectModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        project={selectedProject}
      />
    </main>
  );
}