"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, BookOpen, User } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

interface User {
  id: string;
  name: string;
  full_name: string;
  email: string | null;
  users_profile_picture_url: string | null;
  title: string | null;
  role: string;
}

interface EnrolledCourse {
  course_id: string;
  progress: string;
  enrolled_at: Date;
  course: {
    id: string;
    title: string;
    description: string;
    cover_image_url: string | null;
    created_at: Date;
  };
}

interface ProfileClientProps {
  user: User;
  enrolledCourses: EnrolledCourse[];
}

export default function ProfileClient({ user, enrolledCourses }: ProfileClientProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const getProgressBadgeVariant = (progress: string) => {
    switch (progress) {
      case "completed":
        return "default";
      case "ongoing":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getProgressText = (progress: string) => {
    switch (progress) {
      case "completed":
        return "Selesai";
      case "ongoing":
        return "Sedang Berjalan";
      default:
        return "Belum Dimulai";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Main Profile Section - Centered */}
          <div className="flex justify-center mb-12">
            <Card className="w-full max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold mb-6">My Profil</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                {/* Profile Picture */}
                <div className="flex justify-center">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={user.users_profile_picture_url || ""} alt={user.full_name} />
                    <AvatarFallback className="text-2xl bg-gray-200">{user.users_profile_picture_url ? <User className="w-16 h-16 text-gray-400" /> : getInitials(user.full_name)}</AvatarFallback>
                  </Avatar>
                </div>

                {/* User Information */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-gray-500">{user.title || "Mahasiswa"}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4 pt-4">
                  <Button variant="default" className="px-6">
                    Edit my profil
                  </Button>
                  <Button variant="outline" className="px-6">
                    Ganti Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrolled Courses Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Enrolled Courses */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Kelas Yang Diikuti
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {enrolledCourses.length > 0 ? (
                    <div className="space-y-4">
                      {enrolledCourses.map((enrollment) => (
                        <div key={enrollment.course_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            {/* Course Image */}
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                              {enrollment.course.cover_image_url ? (
                                <Image src={enrollment.course.cover_image_url} alt={enrollment.course.title} width={64} height={64} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Course Info */}
                            <div className="flex-1 min-w-0">
                              <Link href={`/course/${enrollment.course.id}`} className="block hover:text-blue-600 transition-colors">
                                <h3 className="font-semibold text-gray-900 line-clamp-2">{enrollment.course.title}</h3>
                              </Link>

                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={getProgressBadgeVariant(enrollment.progress)}>{getProgressText(enrollment.progress)}</Badge>
                              </div>

                              <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                                <CalendarDays className="w-4 h-4" />
                                <span>Bergabung: {formatDate(enrollment.enrolled_at)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Belum mengikuti kelas apapun</p>
                      <Link href="/s/dash">
                        <Button variant="outline" className="mt-4">
                          Jelajahi Kelas
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Additional Info (Future Use) */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Statistik Pembelajaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Total Kelas</span>
                      <span className="font-semibold">{enrolledCourses.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-600">Kelas Selesai</span>
                      <span className="font-semibold">{enrolledCourses.filter((e) => e.progress === "completed").length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Kelas Sedang Berjalan</span>
                      <span className="font-semibold">{enrolledCourses.filter((e) => e.progress === "ongoing").length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
