"use client";

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import Link from "next/link";
import Image from "next/image";
import { IconUser, IconClock, IconCircleCheck, IconClock2 } from "@tabler/icons-react";

interface Course {
  id: string;
  course_id: string;
  progress: string; // Add progress field
  enrolled_at: string;
  delisted_at: string | null;
  course: {
    id: string;
    title: string;
    description: string;
    cover_image_url: string | null;
    course_duration: number;
    estimated_time_per_week: number;
    price: number;
    language: string;
    lecturer_id: string;
    created_at: string;
    updated_at: string | null;
    deleted_at: string | null;
    category_id: string;
    admin_review: string | null;
    status: string;
    users: {
      name: string;
      title: string | null;
      full_name: string;
    } | null;
  };
}

interface CourseGridProps {
  enrollments: Course[];
  status: string;
  emptyMessage: string;
}

export function CourseGrid({ enrollments, status, emptyMessage }: CourseGridProps) {
  // Additional safety check
  const safeEnrollments = Array.isArray(enrollments) ? enrollments : [];

  if (safeEnrollments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
      </div>
    );
  }

  const cardVariants = [
    "from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30",
    "from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30",
    "from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30",
    "from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30",
    "from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30",
    "from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30",
  ];

  const getProgressBadge = (progress: string) => {
    switch (progress) {
      case "ongoing":
        return (
          <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <IconClock2 className="w-3 h-3 mr-1" />
            Sedang Berlangsung
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <IconCircleCheck className="w-3 h-3 mr-1" />
            Selesai
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs px-2 py-1">
            Kelas satuan
          </Badge>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {safeEnrollments.map((enrollment, index) => (
        <Card key={`${enrollment.id}-${enrollment.course_id}`} className="flex flex-col overflow-hidden rounded-lg border shadow-sm">
          <div className={`relative w-full aspect-video bg-gradient-to-br ${cardVariants[index % cardVariants.length]}`}>
            {enrollment.course.cover_image_url ? (
              <Image src={enrollment.course.cover_image_url} alt={`Image for ${enrollment.course.title}`} fill className="object-cover mix-blend-multiply" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">{enrollment.course.title.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col flex-grow p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg leading-tight font-semibold text-gray-900 dark:text-gray-100">{enrollment.course.title}</CardTitle>
            </CardHeader>

            <CardDescription className="flex-grow mb-6 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {enrollment.course.description ? enrollment.course.description.substring(0, 100) + "..." : "Post voluptum promissa memini cuius adoptione cuius; quem pollicitus est"}
            </CardDescription>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <IconUser className="w-4 h-4" />
                <span>
                  {enrollment.course.users?.title || "Prof. Dr."} {enrollment.course.users?.name || "Khong Guan, S.E., M.E."}
                </span>
              </div>
              <div className="flex items-center gap-2">{getProgressBadge(enrollment.progress)}</div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <IconClock className="w-4 h-4" />
                <span>{enrollment.course.course_duration || 4} Minggu</span>
              </div>
            </div>

            <CardFooter className="p-0">
              <Link href={`/s/course/${enrollment.course.id}`} className="w-full">
                <Button className="w-full" variant="outline" size="sm">
                  {enrollment.progress === "completed" ? "Review Course" : "Lanjutkan Belajar"}
                </Button>
              </Link>
            </CardFooter>
          </div>
        </Card>
      ))}
    </div>
  );
}
