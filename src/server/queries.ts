import "server-only";
import { db } from "./db";
import { auth } from "@clerk/nextjs/server";
import { profiles } from "./db/schema";



export async function createProfile() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [profile] = await db
    .insert(profiles)
    .values({
      clerkUserId: userId,
      fullName: null,
      bio: null,
      avatarUrl: null,
      isPublic: true,
    })
    .onConflictDoNothing({ target: profiles.clerkUserId }) // Prevents error if exists
    .returning();

  if (!profile) {
    return await db.query.profiles.findFirst({
      where: (p, { eq }) => eq(p.clerkUserId, userId),
    });
  }

  return profile;
}