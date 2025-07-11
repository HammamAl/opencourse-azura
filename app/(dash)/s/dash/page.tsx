import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { IconUser, IconDoor } from "@tabler/icons-react";
import { prisma } from "@/lib/prisma";
import { StudentCoursesTabsWrapper } from "@/components/Student-CoursesTabsWrapper";

// Helper function to serialize course data for client components
function serializeCourseData(enrollments: any[]) {
  console.log("Serializing enrollments:", enrollments.length);
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
  console.log("=== DEBUG ALL ENROLLMENTS ===");

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

  console.log(`Found ${allEnrollments.length} total enrollments:`);
  allEnrollments.forEach((enrollment, index) => {
    console.log(`Enrollment ${index + 1}:`, {
      courseId: enrollment.course_id,
      courseTitle: enrollment.course.title,
      courseStatus: enrollment.course.status,
      courseDeleted: enrollment.course.deleted_at,
      progress: enrollment.progress,
      enrolledAt: enrollment.enrolled_at,
      delistedAt: enrollment.delisted_at,
    });
  });

  return allEnrollments;
}

// Get ALL student courses without filtering by progress
async function getAllStudentCourses(userId: string) {
  if (!userId) {
    console.log("No userId provided for getAllStudentCourses");
    return [];
  }

  console.log("=== GET ALL STUDENT COURSES ===");
  console.log("Fetching all courses for userId:", userId);

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

    console.log("All courses found:", enrollments.length);
    console.log(
      "Course details:",
      enrollments.map((e) => ({
        courseId: e.course_id,
        courseTitle: e.course.title,
        progress: e.progress,
        enrolledAt: e.enrolled_at,
        courseStatus: e.course.status,
      }))
    );

    return serializeCourseData(enrollments);
  } catch (error) {
    console.error("Error fetching all student courses:", error);
    return [];
  }
}

// Get student courses with progress = "ongoing"
async function getProgressStudentCourses(userId: string) {
  if (!userId) return [];

  console.log("=== GET PROGRESS COURSES ===");

  try {
    const enrollments = await prisma.course_enrollment.findMany({
      where: {
        id: userId,
        delisted_at: null,
        progress: "ongoing", // Filter by progress status
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

    console.log("Progress courses found:", enrollments.length);
    console.log(
      "Progress courses details:",
      enrollments.map((e) => ({
        courseId: e.course_id,
        courseTitle: e.course.title,
        progress: e.progress,
      }))
    );

    return serializeCourseData(enrollments);
  } catch (error) {
    console.error("Error fetching progress student courses:", error);
    return [];
  }
}

// Get student courses with progress = "completed"
async function getCompletedStudentCourses(userId: string) {
  if (!userId) return [];

  console.log("=== GET COMPLETED COURSES ===");

  try {
    const enrollments = await prisma.course_enrollment.findMany({
      where: {
        id: userId,
        delisted_at: null,
        progress: "completed", // Filter by progress status
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

    console.log("Completed courses found:", enrollments.length);
    console.log(
      "Completed courses details:",
      enrollments.map((e) => ({
        courseId: e.course_id,
        courseTitle: e.course.title,
        progress: e.progress,
      }))
    );

    return serializeCourseData(enrollments);
  } catch (error) {
    console.error("Error fetching completed student courses:", error);
    return [];
  }
}

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || "";

  console.log("=== STUDENT DASHBOARD START ===");
  console.log("Student Dashboard - User ID:", userId);
  console.log("Current date:", new Date().toISOString());

  // Fetch all course data on the server side
  let allCourses = [];
  let progressCourses = [];
  let completedCourses = [];

  try {
    console.log("Starting to fetch all course data...");

    // Fetch sequentially to see which one fails
    allCourses = await getAllStudentCourses(userId);
    console.log("All courses fetched:", allCourses.length);

    progressCourses = await getProgressStudentCourses(userId);
    console.log("Progress courses fetched:", progressCourses.length);

    completedCourses = await getCompletedStudentCourses(userId);
    console.log("Completed courses fetched:", completedCourses.length);

    console.log("=== FINAL RESULTS ===");
    console.log("All courses:", allCourses.length);
    console.log("Progress courses:", progressCourses.length);
    console.log("Completed courses:", completedCourses.length);
  } catch (error) {
    console.error("Error fetching student course data:", error);
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
