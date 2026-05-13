"use client";

interface ViewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

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

export default function ViewProjectModal({ isOpen, onClose, project }: ViewProjectModalProps) {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="flex flex-col w-full max-w-2xl max-h-[90vh] rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900">{project.name}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Description</p>
              <p className="text-sm leading-7 text-slate-600 whitespace-pre-wrap">{project.description}</p>
            </div>
          ) : (
            <p className="text-sm leading-7 text-slate-500">No description provided.</p>
          )}

          {project.tags && project.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-3 text-sm text-slate-500 sm:grid-cols-[auto_auto]">
            <div className="flex flex-wrap items-center gap-3">
              <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>By: {project.userFullName ?? project.clerkUserId}</span>
            </div>
            {project.rolesNeededCount ? (
              <div className="flex items-center justify-start sm:justify-end">
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  {project.rolesNeededCount} role{project.rolesNeededCount > 1 ? "s" : ""} needed
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}