import { PrismaClient } from "@/generated/prisma";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CourseDetailsContent } from "@/components/course/CourseDetailsContent";

const prisma = new PrismaClient();

async function getCourse(id: string) {
  const course = await prisma.course.findUnique({
    where: {
      id: id,
      status: "published",
      deleted_at: null,
    },
    include: {
      users: {
        select: {
          full_name: true,
          title: true,
          users_profile_picture_url: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
      course_enrollment: {
        select: {
          id: true,
        },
      },
      course_learning_target: {
        select: {
          id: true,
          description: true,
          order_index: true,
        },
        orderBy: {
          order_index: "asc",
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  return {
    ...course,
    course_duration: Number(course.course_duration),
    estimated_time_per_week: Number(course.estimated_time_per_week),
    price: Number(course.price),
  };
}

async function getInstructors(courseId: string) {
  const instructors = await prisma.users.findMany({
    where: {
      role: "lecturer",
      course: {
        some: {
          id: courseId,
        },
      },
    },
    select: {
      id: true,
      full_name: true,
      title: true,
      users_profile_picture_url: true,
    },
  });

  return instructors;
}

interface CourseDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseDetailsPage({ params }: CourseDetailsPageProps) {
  const { id } = await params;

  const course = await getCourse(id);
  const instructors = await getInstructors(id);
  const enrollmentCount = course.course_enrollment.length;

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main className="container mx-auto px-6 py-8">
        <CourseDetailsContent course={course} enrollmentCount={enrollmentCount} instructors={instructors} />
      </main>
      <Footer />
    </div>
  );
}
