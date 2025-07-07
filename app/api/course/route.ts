import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { softDeleteFilter } from "@/lib/softDelete";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";

const querySchema = z.object({
  filter: z.enum(["need-review", "published", "reviewed", "draft", "all"])
    .default("all"),
  sortBy: z.enum(["oldest", "newest"]).default("newest"),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Extract query parameters from the URL
  const { searchParams } = new URL(request.url);
  const queryParams = {
    filter: searchParams.get("filter") || "all",
    sortBy: searchParams.get("sortBy") || "newest",
  };

  const parsed = querySchema.safeParse(queryParams);

  if (!parsed.success) {
    console.log("Validation error:", parsed.error);
    return NextResponse.json(
      {
        error: "Invalid query parameters",
        details: parsed.error.errors,
      },
      { status: 400 },
    );
  }

  const { filter, sortBy } = parsed.data;
  const now = new Date();

  const sortByArgument: Prisma.courseOrderByWithRelationInput =
    sortBy === "oldest" ? { created_at: "asc" } : { created_at: "desc" };

  let whereClause: Prisma.courseWhereInput = softDeleteFilter(now);

  switch (filter) {
    case "need-review":
      whereClause = softDeleteFilter(now, { status: "need-review" });
      break;
    case "published":
      whereClause = softDeleteFilter(now, { status: "published" });
      break;
    case "reviewed":
      whereClause = softDeleteFilter(now, { status: "reviewed" });
      break;
    case "draft":
      whereClause = softDeleteFilter(now, { status: "draft" });
      break;
    case "all":
      // softDeleteFilter only
      break;
  }

  try {
    const courses = await prisma.course.findMany({
      where: whereClause,
      orderBy: sortByArgument,
      include: {
        users: {
          select: { name: true },
        },
        category: {
          select: { name: true },
        },
      },
    });

    const mappedCourses = courses.map((course) => ({
      ...course,
      lecturer_name: course.users.name,
      category_name: course.category.name,
    }));

    return NextResponse.json(mappedCourses);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
