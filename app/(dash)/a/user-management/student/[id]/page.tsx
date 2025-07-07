import { prisma } from "@/lib/db";
import { StudentDetailClient } from "@/components/Admin-StudentDetailClient";
import { notFound } from "next/navigation";

async function getStudentDetail(id: string) {
  const student = await prisma.users.findFirst({
    where: {
      id: id,
      role: "student",
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      created_at: true,
      deleted_at: true,
      users_profile_picture_url: true,
      course_enrollment: {
        select: {
          course_id: true,
          enrolled_at: true,
          course: {
            select: {
              id: true,
              title: true,
              cover_image_url: true,
            },
          },
        },
      },
    },
  });

  if (!student) {
    return null;
  }

  return {
    ...student,
    email: student.email ?? "",
    total_courses: student.course_enrollment.length,
  };
}

export default async function StudentDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const student = await getStudentDetail(resolvedParams.id);

  if (!student) {
    notFound();
  }

  return <StudentDetailClient student={student} />;
}
