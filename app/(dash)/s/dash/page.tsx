import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { IconUser, IconDoor } from "@tabler/icons-react";
import { prisma } from "@/lib/prisma";
import { StudentCoursesTabsWrapper } from "@/components/Student-CoursesTabsWrapper";

// Helper function to serialize course data for client components
function serializeCourseData(enrollments: any[]) {
  return enrollments.map((enrollment) => ({
    ...enrollment,
    enrolled_at: enrollment.enrolled_at.toISOString(),
    delisted_at: enrollment.delisted_at?.toISOString() || null,
    progress: enrollment.progress, // Include progress field
    course: {
      ...enrollment.course,
      course_duration: Number(enrollment.course.course_duration),
      estimated_time_per_week: Number(enrollment.course.estimated_time_per_week),
      price: Number(enrollment.course.price),
      created_at: enrollment.course.created_at.toISOString(),
      updated_at: enrollment.course.updated_at?.toISOString() || null,
      deleted_at: enrollment.course.deleted_at?.toISOString() || null,
    },
  }));
}

// Debug function to check all enrollments
async function debugAllEnrollments(userId: string) {
  const allEnrollments = await prisma.course_enrollment.findMany({
    where: {
      id: userId,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          status: true,
          deleted_at: true,
        },
      },
    },
  });

  return allEnrollments;
}

// Get ALL student courses without filtering by progress
async function getAllStudentCourses(userId: string) {
  if (!userId) {
    return [];
  }

  try {
    // First debug all enrollments
    await debugAllEnrollments(userId);

    // Get all enrollments regardless of progress
    const enrollments = await prisma.course_enrollment.findMany({
      where: {
        id: userId,
        delisted_at: null,
        course: {
          deleted_at: null,
        },
      },
      include: {
        course: {
          include: {
            users: {
              select: {
                name: true,
                title: true,
                full_name: true,
              },
            },
          },
        },
      },
      orderBy: [{ enrolled_at: "desc" }],
    });

    return serializeCourseData(enrollments);
  } catch (error) {
    return [];
  }
}

// Get student courses with progress = "ongoing"
async function getProgressStudentCourses(userId: string) {
  if (!userId) return [];

  try {
    const enrollments = await prisma.course_enrollment.findMany({
      where: {
        id: userId,
        delisted_at: null,
        progress: "ongoing",
        course: {
          deleted_at: null,
        },
      },
      include: {
        course: {
          include: {
            users: {
              select: {
                name: true,
                title: true,
                full_name: true,
              },
            },
          },
        },
      },
      orderBy: [{ enrolled_at: "desc" }],
    });
    return serializeCourseData(enrollments);
  } catch (error) {
    return [];
  }
}

// Get student courses with progress = "completed"
async function getCompletedStudentCourses(userId: string) {
  if (!userId) return [];
  try {
    const enrollments = await prisma.course_enrollment.findMany({
      where: {
        id: userId,
        delisted_at: null,
        progress: "completed",
        course: {
          deleted_at: null,
        },
      },
      include: {
        course: {
          include: {
            users: {
              select: {
                name: true,
                title: true,
                full_name: true,
              },
            },
          },
        },
      },
      orderBy: [{ enrolled_at: "desc" }],
    });

    return serializeCourseData(enrollments);
  } catch (error) {
    return [];
  }
}

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || "";

  // Fetch all course data on the server side
  let allCourses = [];
  let progressCourses = [];
  let completedCourses = [];

  try {
    // Fetch sequentially to see which one fails
    allCourses = await getAllStudentCourses(userId);
    progressCourses = await getProgressStudentCourses(userId);
    completedCourses = await getCompletedStudentCourses(userId);
  } catch (error) {
    allCourses = [];
    progressCourses = [];
    completedCourses = [];
  }

  return (
    <>
      {/* Welcome Message */}
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <IconUser className="w-6 h-6" />
          Selamat datang kembali, {session?.user?.name}!
        </h1>
      </div>

      {/* Section Header for Courses */}
      <h2 className="px-4 lg:px-6 flex items-center gap-2">
        <IconDoor className="w-5 h-5" />
        Kelas Kamu
      </h2>

      {/* Student Courses Dashboard with Tabs */}
      <StudentCoursesTabsWrapper userId={userId} allCourses={allCourses} progressCourses={progressCourses} completedCourses={completedCourses} />
    </>
  );
}
