import { prisma } from "@/lib/db";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from 'next/image';

async function getMainCourses() {
  const data = await prisma.course.findMany({
    take: 6,
    orderBy: [{ updated_at: 'desc' }]
  });
  return data;
}

export async function CourseMainDashboard() {
  const courseData = await getMainCourses();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 lg:px-6">
      {courseData.map((course) => (
        <Card key={course.id} className="flex flex-col overflow-hidden rounded-lg">
          <div className="relative w-full aspect-video bg-muted">
            {course.cover_image_url ? (
              // If image_url exists, display the image
              <Image
                src={course.cover_image_url}
                alt={`Image for ${course.title}`}
                fill
                className="object-cover"
              />
            ) : (
              // Otherwise, display a simple placeholder
              <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <span className="text-xs text-gray-500">No Image</span>
              </div>
            )}
          </div>

          <div className="flex flex-col flex-grow px-4">
            <CardHeader className="p-0 mb-2">
              <CardTitle>{course.title}</CardTitle>
            </CardHeader>
            <CardDescription className="flex-grow">
              {course.description
                ? course.description.substring(0, 100) + '...'
                : 'No description available.'}
            </CardDescription>
            <CardFooter className="p-0 mt-4">
              <Link href={`/courses/${course.id}`} className="w-full">
                <Button className="w-full">View Course</Button>
              </Link>
            </CardFooter>
          </div>
        </Card>
      ))}
    </div>
  );
}
