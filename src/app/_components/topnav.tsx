'use client';

import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TopNav() {
  const router = useRouter();

  const handleCreateClick = () => {
    if (window.location.pathname === "/") {
      window.dispatchEvent(new Event("openCreateProjectModal"));
      window.history.pushState({}, "", "/?create=true");
    } else {
      router.push("/?create=true");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/90 px-4 py-3 shadow-lg shadow-slate-950/20 backdrop-blur-md">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-3 max-w-6xl text-slate-100">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white hover:text-slate-200">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-sm font-black uppercase text-slate-100">
            N
          </span>
          <span>notiontab</span>
        </Link>

        <div className="flex items-center gap-3">
          <Show when="signed-in">
            <button
              type="button"
              onClick={handleCreateClick}
              className="rounded-full border border-slate-700 bg-slate-900/80 p-2 text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </Show>

          <Show when="signed-out">
            <SignInButton>
              <button className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800">
                Sign In
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <UserButton userProfileUrl="/profile" />
          </Show>
        </div>
      </div>
    </nav>
  );
}