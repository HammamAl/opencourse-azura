"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseGrid } from "@/components/CourseGrid";

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

interface StudentCoursesTabsWrapperProps {
  userId: string;
  allCourses: Course[];
  progressCourses: Course[];
  completedCourses: Course[];
}

export function StudentCoursesTabsWrapper({ userId, allCourses = [], progressCourses = [], completedCourses = [] }: StudentCoursesTabsWrapperProps) {
  const [activeTab, setActiveTab] = useState("all");

  if (!userId) {
    return (
      <div className="px-4 lg:px-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">Silakan login untuk melihat kelas Anda.</p>
        </div>
      </div>
    );
  }

  // Additional safety checks
  const safeAllCourses = Array.isArray(allCourses) ? allCourses : [];
  const safeProgressCourses = Array.isArray(progressCourses) ? progressCourses : [];
  const safeCompletedCourses = Array.isArray(completedCourses) ? completedCourses : [];

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/50">
          <TabsTrigger value="all" className="text-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-medium">
            Kelas Kamu ({safeAllCourses.length})
          </TabsTrigger>
          <TabsTrigger value="proses" className="text-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-medium">
            Proses ({safeProgressCourses.length})
          </TabsTrigger>
          <TabsTrigger value="selesai" className="text-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-medium">
            Selesai ({safeCompletedCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <CourseGrid enrollments={safeAllCourses} status="all" emptyMessage="Anda belum mendaftar kelas apapun." />
        </TabsContent>

        <TabsContent value="proses" className="mt-6">
          <CourseGrid enrollments={safeProgressCourses} status="proses" emptyMessage="Tidak ada kelas yang sedang berlangsung." />
        </TabsContent>

        <TabsContent value="selesai" className="mt-6">
          <CourseGrid enrollments={safeCompletedCourses} status="selesai" emptyMessage="Belum ada kelas yang selesai." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
