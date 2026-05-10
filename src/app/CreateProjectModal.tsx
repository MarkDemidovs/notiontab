"use client";

import { useState, type FormEvent } from "react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

interface RoleNeed {
  title: string;
  description: string;
  slotsNeeded: number;
}

interface Project {
  id: number;
  clerkUserId: string;
  userFullName: string | null;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  rolesNeededCount?: number;
}

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [rolesNeeded, setRolesNeeded] = useState<RoleNeed[]>([
    { title: "", description: "", slotsNeeded: 1 },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
        const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          isPublic,
          rolesNeeded: rolesNeeded
            .filter((role) => role.title.trim().length > 0)
            .map((role) => ({
              title: role.title.trim(),
              description: role.description.trim() || null,
              slotsNeeded: Math.max(1, role.slotsNeeded),
            })),
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? "Failed to create project");
      }

      const newProject = (await response.json()) as Project;
      onProjectCreated(newProject);
      handleClose();
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setIsPublic(true);
    setRolesNeeded([{ title: "", description: "", slotsNeeded: 1 }]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Create New Project</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              Project Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Optional project description"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="block text-sm font-medium text-slate-700">Visibility</p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isPublic ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    !isPublic ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  Private
                </button>
              </div>
            </div>
            <div>
              <p className="block text-sm font-medium text-slate-700">Roles needed</p>
              <p className="mt-1 text-sm text-slate-500">Add one or more roles your project needs.</p>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {rolesNeeded.map((role, index) => (
              <div key={index} className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-900">Role {index + 1}</span>
                  {rolesNeeded.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setRolesNeeded((prev) => prev.filter((_, i) => i !== index))}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Title</label>
                    <input
                      type="text"
                      value={role.title}
                      onChange={(e) =>
                        setRolesNeeded((prev) =>
                          prev.map((item, i) =>
                            i === index ? { ...item, title: e.target.value } : item
                          )
                        )
                      }
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                      placeholder="e.g. Designer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Description</label>
                    <input
                      type="text"
                      value={role.description}
                      onChange={(e) =>
                        setRolesNeeded((prev) =>
                          prev.map((item, i) =>
                            i === index ? { ...item, description: e.target.value } : item
                          )
                        )
                      }
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                      placeholder="Optional role details"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Slots</label>
                    <input
                      type="number"
                      min={1}
                      value={role.slotsNeeded}
                      onChange={(e) =>
                        setRolesNeeded((prev) =>
                          prev.map((item, i) =>
                            i === index
                              ? { ...item, slotsNeeded: Math.max(1, Number(e.target.value) || 1) }
                              : item
                          )
                        )
                      }
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setRolesNeeded((prev) => [...prev, { title: "", description: "", slotsNeeded: 1 }])}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Add another role
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}