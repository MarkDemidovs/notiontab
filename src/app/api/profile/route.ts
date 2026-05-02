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

type ProfileUpdateRequest = {
  fullName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  isPublic?: boolean;
  link1?: string | null;
  link2?: string | null;
  link3?: string | null;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  if (!isObject(body)) {
    return new NextResponse("Invalid request body", { status: 400 });
  }

  const parsedBody: ProfileUpdateRequest = {
    fullName: typeof body.fullName === "string" ? body.fullName : null,
    bio: typeof body.bio === "string" ? body.bio : null,
    avatarUrl: typeof body.avatarUrl === "string" ? body.avatarUrl : null,
    isPublic: typeof body.isPublic === "boolean" ? body.isPublic : true,
    link1: typeof body.link1 === "string" ? body.link1 : null,
    link2: typeof body.link2 === "string" ? body.link2 : null,
    link3: typeof body.link3 === "string" ? body.link3 : null,
  };

  const updateData = {
    fullName: parsedBody.fullName,
    bio: parsedBody.bio,
    avatarUrl: parsedBody.avatarUrl,
    isPublic: parsedBody.isPublic,
    link1: parsedBody.link1,
    link2: parsedBody.link2,
    link3: parsedBody.link3,
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
