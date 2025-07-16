import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const queryParams = { q: searchParams.get("q") };
  const parsed = querySchema.safeParse(queryParams);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.errors },
      { status: 400 },
    );
  }

  const { q } = parsed.data;

  const whereClause = {
    deleted_at: null,
    role: "lecturer" as const,
    ...(q && {
      name: {
        contains: q,
        mode: "insensitive" as const,
      },
    }),
  };

  try {
    const users = await prisma.users.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
