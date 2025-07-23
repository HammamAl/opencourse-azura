import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";
import Navbar from "@/components/layout/Navbar";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user is a student
  if (session.user.role !== "student") {
    redirect("/unauthorized");
  }

  try {
    // Fetch user data
    const user = await prisma.users.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        full_name: true,
        email: true,
        users_profile_picture_url: true,
        title: true,
        role: true,
      },
    });

    if (!user) {
      redirect("/login");
    }

    // Fetch enrolled courses
    const enrolledCourses = await prisma.course_enrollment.findMany({
      where: {
        id: session.user.id,
        delisted_at: null, // Only active enrollments
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            cover_image_url: true,
            created_at: true,
          },
        },
      },
      orderBy: {
        enrolled_at: "desc",
      },
    });

    return <ProfileClient user={user} enrolledCourses={enrolledCourses} />;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Error Loading Profile</h1>
            <p className="text-gray-600 mt-2">Please try again later.</p>
          </div>
        </div>
      </>
    );
  }
}
