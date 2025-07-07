import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a lecturer
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== "lecturer") {
      return NextResponse.json({ error: "Forbidden: Lecturer access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const sortBy = searchParams.get("sortBy") || "newest";

    // Build where clause
    let whereClause: any = {
      lecturer_id: session.user.id,
      deleted_at: null,
    };

    if (filter !== "all") {
      whereClause.status = filter;
    }

    // Build orderBy clause
    const orderBy = sortBy === "newest" ? { created_at: "desc" as const } : { created_at: "asc" as const };

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        users: {
          select: {
            name: true,
          },
        },
      },
      orderBy,
    });

    // Transform the data to match the expected interface
    const transformedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      course_duration: Number(course.course_duration),
      estimated_time_per_week: Number(course.estimated_time_per_week),
      price: Number(course.price),
      language: course.language,
      lecturer_id: course.lecturer_id,
      cover_image_url: course.cover_image_url,
      created_at: course.created_at.toISOString(),
      updated_at: course.updated_at?.toISOString() || null,
      deleted_at: course.deleted_at?.toISOString() || null,
      category_id: course.category_id,
      admin_review: course.admin_review,
      status: course.status,
      lecturer_name: course.users.name,
      category_name: course.category.name,
    }));

    return NextResponse.json(transformedCourses);
  } catch (error) {
    console.error("Error fetching lecturer courses:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
