'use client';

import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function TopNav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/90 px-4 py-3 shadow-lg shadow-slate-950/20 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 text-slate-100">
        <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white hover:text-slate-200">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-sm font-black uppercase text-slate-100">
            N
          </span>
          <span>notiontab</span>
        </Link>

        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton>
              <button className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800">
                Sign In
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </nav>
  );
}