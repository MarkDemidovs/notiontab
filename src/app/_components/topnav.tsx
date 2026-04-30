'use client';

import { SignInButton, Show } from "@clerk/nextjs";
import Link from "next/link";

export default function TopNav() {
  return(
    <nav className="flex w-full items-center justify-between">
      <div>
        <Link href="/">
          <button className="cursor-pointer">notiontab</button>
        </Link>
      </div>
      <div>
        <Show when="signed-out">
          <SignInButton />
        </Show>
        <Show when="signed-in">
          <Link href="/profile">
            <button className="cursor-pointer">Profile Settings</button>
          </Link>
        </Show>
      </div>
    </nav>
  )
}