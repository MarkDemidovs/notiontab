import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { profiles } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const defaultProfileValues = {
  fullName: null,
  bio: null,
  avatarUrl: null,
  isPublic: true,
  link1: null,
  link2: null,
  link3: null,
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const existingProfile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.clerkUserId, userId),
  });

  if (existingProfile) {
    return NextResponse.json(existingProfile);
  }

  await db.insert(profiles).values({ clerkUserId: userId, ...defaultProfileValues }).onConflictDoNothing({ target: profiles.clerkUserId });

  const profile = await db.query.profiles.findFirst({
    where: (p, { eq }) => eq(p.clerkUserId, userId),
  });

  if (!profile) {
    return new NextResponse("Unable to create profile", { status: 500 });
  }

  return NextResponse.json(profile);
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const updateData = {
    fullName: body.fullName ?? null,
    bio: body.bio ?? null,
    avatarUrl: body.avatarUrl ?? null,
    isPublic: typeof body.isPublic === "boolean" ? body.isPublic : true,
    link1: body.link1 ?? null,
    link2: body.link2 ?? null,
    link3: body.link3 ?? null,
  };

  const result = await db.update(profiles)
    .set(updateData)
    .where(eq(profiles.clerkUserId, userId))
    .returning();

  const updated = result[0];

  if (!updated) {
    await db.insert(profiles).values({ clerkUserId: userId, ...updateData }).onConflictDoNothing({ target: profiles.clerkUserId });
    const createdProfile = await db.query.profiles.findFirst({
      where: (p, { eq }) => eq(p.clerkUserId, userId),
    });

    if (!createdProfile) {
      return new NextResponse("Unable to save profile", { status: 500 });
    }

    return NextResponse.json(createdProfile);
  }

  return NextResponse.json(updated);
}
