import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { softDeleteFilter } from "@/lib/softDelete";
import { z } from "zod";
import * as argon2 from "argon2";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // role check
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Lecturer ID is required" }, {
      status: 400,
    });
  }

  const lecturer = await prisma.users.findFirst({
    where: softDeleteFilter(new Date(), {
      id,
      role: "lecturer",
    }),
  });

  if (!lecturer) {
    return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
  }

  return NextResponse.json(lecturer);
}

const updateLecturerSchema = z.object({
  full_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  nidn_number: z.string().optional(),
  phone_number: z.string().optional(),
  title: z.string().optional(),
  password: z.string().optional(),
  users_profile_picture_url: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Lecturer ID is required" }, {
      status: 400,
    });
  }

  const body = await request.json();

  const parse = updateLecturerSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parse.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parse.data;

  const lecturer = await prisma.users.findFirst({
    where: softDeleteFilter(new Date(), {
      id,
      role: "lecturer",
    }),
  });

  if (!lecturer) {
    return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
  }

  const { password, ...rest } = data;

  const updatePayload = {
    ...rest,
    updated_at: new Date(),
    ...(password && { password: await argon2.hash(password) }),
  };

  const updatedLecturer = await prisma.users.update({
    where: { id },
    data: updatePayload,
  });

  const { password: _, ...lecturerResponse } = updatedLecturer;

  return NextResponse.json(lecturerResponse);
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Lecturer ID is required" }, {
      status: 400,
    });
  }

  const lecturer = await prisma.users.findFirst({
    where: softDeleteFilter(new Date(), {
      id,
      role: "lecturer",
    }),
  });

  if (!lecturer) {
    return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
  }

  const deletedLecturer = await prisma.users.update({
    where: { id },
    data: {
      email: null,
      deleted_at: new Date()
    },
  });

  return NextResponse.json(deletedLecturer);
}
