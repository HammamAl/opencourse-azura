import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Extract and validate ID using Zod
  const id = request.nextUrl.pathname.split("/").at(-2);

  const idSchema = z.string();
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const courseData = await prisma.course.findUnique({
    where: { id: parsedId.data },
  });

  if (!courseData) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updatedData = await prisma.course.update({
    where: { id: parsedId.data },
    data: { status: "published" },
  });

  return NextResponse.json({
    id: updatedData.id,
    admin_review: updatedData.admin_review,
    title: updatedData.title,
  });
}
