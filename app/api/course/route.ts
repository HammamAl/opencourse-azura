import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { softDeleteFilter } from "@/lib/softDelete";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import { v7 } from "uuid";
import getVideoId from "get-video-id";

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

const materialSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  youtube_link: z.string().optional(),
}).refine((data) => {
  if (data.youtube_link && data.youtube_link.trim() !== "") {
    const { id } = getVideoId(data.youtube_link);
    return !!id;
  }
  return true;
}, {
  message: "Invalid YouTube link provided. Please provide a valid video URL.",
  path: ["youtube_link"],
});

const sectionSchema = z.object({
  id: z.string().uuid().optional(), // Frontend might send a temporary UUID
  title: z.string().min(1, "Section title is required"),
  order_index: z.number().int().nonnegative(),
  course_material: z.array(materialSchema),
  isOpen: z.boolean().optional(),
});

const learningTargetSchema = z.object({
  id: z.string().uuid().optional(), // Frontend might send a temporary UUID
  description: z.string().min(1, "Learning target description is required"),
  order_index: z.number().int().nonnegative(),
});

// Main schema for the entire course data structure
const courseCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(20, "Description must be at least 20 characters long"),
  course_duration: z.number().int().positive(),
  estimated_time_per_week: z.number().int().positive(),
  price: z.number().int().nonnegative(),
  language: z.string().length(2, "Language must be a 2-character code"),
  lecturer_id: z.string().uuid(),
  cover_image_url: z.string().url("Must be a valid URL").or(z.literal("")),
  category_id: z.string().uuid(),
  status: z.enum(["draft", "need-review", "reviewed", "published"]),
  course_section: z.array(sectionSchema),
  course_learning_target: z.array(learningTargetSchema),
});

/**
 * @description Handle POST requests to create a new course with its sections,
 * materials, and learning targets in a single transaction.
 * @param {NextRequest} request The incoming request object.
 * @returns {NextResponse} The response object.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = courseCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid request body",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { course_section, course_learning_target, ...courseMainData } = validation.data;

    const sectionsToCreate = course_section.map(section => {
      // Omit the temporary 'id' from the frontend if it exists.
      const { id, course_material, ...sectionData } = section;
      return {
        id: v7(), // Generate a new, secure UUID for the database.
        ...sectionData,
        course_material: {
          create: course_material.map(material => ({
            id: v7(), // Generate UUID for each material.
            ...material,
          })),
        },
      };
    });

    const learningTargetsToCreate = course_learning_target.map(target => {
      // Omit the temporary 'id' from the frontend if it exists.
      const { id, ...targetData } = target;
      return {
        id: v7(), // Generate a new, secure UUID for the database.
        ...targetData,
      };
    });

    const newCourse = await prisma.course.create({
      data: {
        id: v7(),
        ...courseMainData,
        course_section: { create: sectionsToCreate },
        course_learning_target: { create: learningTargetsToCreate },
      },
      include: {
        course_section: {
          include: {
            course_material: true,
          },
        },
        course_learning_target: true,
      },
    });

    return NextResponse.json(
      { message: "Course created successfully", data: newCourse },
      { status: 201 },
    );

  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "Invalid JSON format provided" }, {
        status: 400,
      });
    }
    console.error(error);
    return NextResponse.json({ message: "An unexpected error occurred on the server." }, {
      status: 500,
    });
  }
}
