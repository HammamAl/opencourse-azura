import { notFound, redirect } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Clock, BookOpen, Star } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

async function getCourseForStudent(courseId: string, studentId: string) {
  // First check if student is enrolled in this course
  const enrollment = await prisma.course_enrollment.findFirst({
    where: {
      id: studentId,
      course_id: courseId,
      delisted_at: null,
    },
  });

  if (!enrollment) {
    return null; // Student not enrolled
  }

  // Get course details
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      deleted_at: null,
    },
    include: {
      users: {
        select: {
          full_name: true,
          title: true,
          name: true,
          users_profile_picture_url: true,
        },
      },
      category: {
        select: {
          name: true,
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
      course_section: {
        include: {
          course_material: {
            where: {
              deleted_at: null,
            },
            orderBy: {
              created_at: "asc",
            },
          },
        },
        where: {
          deleted_at: null,
        },
        orderBy: {
          order_index: "asc",
        },
      },
    },
  });

  if (!course) {
    return null;
  }

  return {
    ...course,
    course_duration: Number(course.course_duration),
    estimated_time_per_week: Number(course.estimated_time_per_week),
    price: Number(course.price),
    enrollment,
  };
}

interface StudentCourseDetailsPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function StudentCourseDetailsPage({ params }: StudentCourseDetailsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "student") {
    redirect("/unauthorized");
  }

  const courseId = (await params).courseId;
  const course = await getCourseForStudent(courseId, session.user.id);

  if (!course) {
    notFound();
  }

  const courseSections = course.course_section;

  return (
    <div className="bg-white min-h-screen">
      <main className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8 min-w-0 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
          </div>
          <div className="lg:col-span-1">
            <Button asChild variant="outline" size="sm" className="w-full py-5">
              <Link href="/s/dash">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Two Column Layout - Main Content and Course Info */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Course Content */}
          <div className="lg:col-span-3 space-y-8 min-w-0">
            {/* Course Description */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Deskripsi Kelas</h2>
              <p className="text-gray-600 leading-relaxed">{course.description}</p>
            </div>

            {/* Learning Targets */}
            {course.course_learning_target.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Target Pembelajaran</h2>
                <ul className="space-y-2">
                  {course.course_learning_target.map((target) => (
                    <li key={target.id} className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{target.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator className="my-8" />

            {/* Course Content Sections */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Materi Kelas</h2>
              <Accordion type="multiple" className="w-full" defaultValue={courseSections.length > 0 ? [`section-${courseSections[0].id}`] : []}>
                {courseSections.map((section, index) => (
                  <AccordionItem key={section.id} value={`section-${section.id}`}>
                    <AccordionTrigger className="cursor-pointer hover:text-gray-700 text-left">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">
                          {index + 1}
                        </Badge>
                        {section.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4">
                      {section.course_material && section.course_material.length > 0 ? (
                        <div className="space-y-3">
                          {section.course_material.map((material, materialIndex) => (
                            <div key={material.id} className="border-l-2 border-emerald-200 pl-4 py-2">
                              <Link href={`/s/dash/course/${course.id}/${material.course_section_id}/${material.id}`} className="flex items-center gap-3 hover:text-emerald-600 transition-colors">
                                <BookOpen className="h-4 w-4" />
                                <span className="font-medium">{material.title}</span>
                              </Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">Belum ada materi untuk section ini.</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
                {courseSections.length === 0 && (
                  <AccordionItem value="no-sections">
                    <AccordionTrigger className="cursor-pointer hover:text-gray-700">Konten Kelas</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-500 italic">Belum ada section kelas yang tersedia.</p>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          </div>

          {/* Right Column - Course Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Kelas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Instructor Info */}
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {course.users?.title} {course.users?.name}
                      </p>
                      <p className="text-sm text-gray-600">Instruktur</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Course Duration */}
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{course.course_duration} Minggu</p>
                      <p className="text-sm text-gray-600">Durasi Kelas</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Category */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Kategori</p>
                    <Badge variant="outline">{course.category.name}</Badge>
                  </div>

                  <Separator />

                  {/* Language */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Bahasa</p>
                    <Badge variant="outline">{course.language}</Badge>
                  </div>

                  <Separator />

                  {/* Enrollment Date */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Tanggal Mendaftar</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(course.enrollment.enrolled_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
