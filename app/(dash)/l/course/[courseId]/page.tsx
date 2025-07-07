import { notFound, redirect } from "next/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

async function getCourse(id: string, lecturerId: string) {
  const course = await prisma.course.findUnique({
    where: {
      id: id,
      lecturer_id: lecturerId,
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
    notFound();
  }

  return {
    ...course,
    course_duration: Number(course.course_duration),
    estimated_time_per_week: Number(course.estimated_time_per_week),
    price: Number(course.price),
  };
}

async function getAdminReview(courseId: string) {
  try {
    const review = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        admin_review: true,
        updated_at: true,
      },
    });

    return review;
  } catch (error) {
    console.error("Error fetching admin review:", error);
    return null;
  }
}

interface CourseDetailsPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function LecturerCourseDetailsPage({ params }: CourseDetailsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "lecturer") {
    redirect("/unauthorized");
  }

  const id = (await params).courseId;
  const course = await getCourse(id, session.user.id);
  const adminReview = await getAdminReview(id);
  const course_section = course.course_section;

  return (
    <div className="bg-white min-h-screen">
      <main className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8 min-w-0 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
          </div>
          <div className="lg:col-span-1">
            <Button asChild variant="outline" size="sm" className="w-full py-5">
              <Link href="/l/course">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Link>
            </Button>
          </div>
        </div>
        {/* Two Column Layout - Main Content and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Course Content and Admin Review */}
          <div className="lg:col-span-3 space-y-8 min-w-0">
            {/* Course Content Sections */}
            <div>
              <Accordion type="multiple" className="w-full" defaultValue={course_section.length > 0 ? [`section-${course_section[0].id}`] : []}>
                {course_section.map((section, index) => (
                  <AccordionItem key={section.id} value={`section-${section.id}`}>
                    <AccordionTrigger className="cursor-pointer hover:text-gray-700">{section.title}</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4">
                      {section.course_material && section.course_material.length > 0 ? (
                        <div className="space-y-3">
                          {section.course_material.map((material) => (
                            <div key={material.id} className="border-l-2 border-gray-200 pl-4">
                              <Link href={`/l/course/${course.id}/${material.course_section_id}/${material.id}`}>{material.title}</Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No materials available for this section.</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
                {course_section.length === 0 && (
                  <AccordionItem value="no-sections">
                    <AccordionTrigger className="cursor-pointer hover:text-gray-700">Course Content</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-500 italic">No course sections available yet.</p>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>

            {/* Admin Review Section */}
            <div className="space-y-6">
              <Separator className="my-10" />

              {/* Current Admin Review Display */}
              {adminReview?.admin_review && (
                <Card className="border-l-4 border-l-orange-500 gap-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquare className="h-5 w-5 text-orange-600" />
                        Ulasan dari Admin
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{adminReview.admin_review}</p>
                    </div>
                    {adminReview.updated_at && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          Last updated:{" "}
                          {new Date(adminReview.updated_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* No Review State */}
              {!adminReview?.admin_review && (
                <Card className="border-dashed border-2">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada ulasan admin</h3>
                    <p className="text-gray-500 mb-4 max-w-md">Tunggu admin untuk memberikan ulasan tentang kelas ini</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          {/* Right Column - Action Buttons */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <Card className="py-3">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Button asChild className="w-full">
                      <Link href={`/l/course/${course.id}/edit`}>Edit Kelas</Link>
                    </Button>
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
