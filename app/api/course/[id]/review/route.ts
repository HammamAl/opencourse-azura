import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const reviewSchema = z.object({
  admin_review: z.string(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid body",
        details: parsed.error.errors,
      },
      { status: 400 },
    );
  }

  const id = request.nextUrl.pathname.split("/").at(-2); // grabs `[id]` in `[id]/review/route.ts`

  if (!id) {
    return NextResponse.json({ error: "Missing course ID in path" }, {
      status: 400,
    });
  }

  const courseData = await prisma.course.findUnique({
    where: { id },
  });

  if (!courseData) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const updatedData = await prisma.course.update({
    where: { id },
    data: {
      admin_review: parsed.data.admin_review,
      status: "reviewed",
      updated_at: new Date(),
    },
  });

  return NextResponse.json({
    id: updatedData.id,
    admin_review: updatedData.admin_review,
    title: updatedData.title,
  });
}
