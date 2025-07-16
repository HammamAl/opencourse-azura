import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const idSchema = z.string();
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid ID format" }, {
      status: 400,
    });
  }

  const courseData = await prisma.course.findUnique({
    where: { id: parsedId.data, deleted_at: null, status: "published" },
  });

  if (!courseData) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const {
    admin_review,
    deleted_at,
    updated_at,
    created_at,
    ...cleanCourseData
  } = courseData;

  return NextResponse.json(cleanCourseData);
}
