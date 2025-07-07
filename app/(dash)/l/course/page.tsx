"use client";

import React, { useState, useEffect, JSX } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, BookOpen, AlertCircle, Clock, DollarSign, Globe, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

// --- Type Definitions ---
interface Course {
  id: string;
  title: string;
  description: string;
  course_duration: number;
  estimated_time_per_week: number;
  price: number;
  language: string;
  lecturer_id: string;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  category_id: string;
  admin_review: string | null;
  lecturer_name: string;
  category_name: string;
  status: statusValue;
}

type statusValue = "need-review" | "published" | "reviewed" | "draft";
type FilterValue = statusValue | "all";
type SortValue = "newest" | "oldest";

// --- Constants ---
const tabs: { value: FilterValue; label: string }[] = [
  { value: "draft", label: "Draf" },
  { value: "need-review", label: "Perlu Diulas" },
  { value: "reviewed", label: "Sudah Diulas" },
  { value: "published", label: "Publikasi" },
  { value: "all", label: "Semua" },
];

const sortOptions: { value: SortValue; label: string }[] = [
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
];

// --- Component ---
export default function LecturerCourseManagement() {
  const [activeTab, setActiveTab] = useState<FilterValue>("all");
  const [sortBy, setSortBy] = useState<SortValue>("newest");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async (filter: FilterValue, sort: SortValue) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        filter: filter,
        sortBy: sort,
      });

      const response = await fetch(`/api/lecturer/courses?${params}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Please log in");
        }
        if (response.status === 403) {
          throw new Error("Forbidden: Lecturer access required");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: Course[] = await response.json();
      setCourses(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(activeTab, sortBy);
  }, [activeTab, sortBy]);

  const getStatusBadges = (course: Course) => {
    const badges: JSX.Element[] = [];
    if (course.status === "need-review") {
      badges.push(
        <Badge key="need-review" variant="destructive" className="bg-yellow-100 text-yellow-800">
          Perlu Diulas
        </Badge>
      );
    }

    if (course.status === "reviewed") {
      badges.push(
        <Badge key="reviewed" variant="secondary" className="bg-blue-100 text-blue-800">
          Sudah Diulas
        </Badge>
      );
    }

    if (course.status === "draft") {
      badges.push(
        <Badge key="draft" variant="outline" className="bg-gray-100 text-gray-800">
          Draf
        </Badge>
      );
    }

    if (course.status === "published") {
      badges.push(
        <Badge key="published" variant="default" className="bg-green-100 text-green-800">
          Publikasi
        </Badge>
      );
    }

    return badges;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="pb-4 pt-0 gap-2 hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Cover Image Section */}
      <div className="relative h-48 w-full bg-gray-100">
        {course.cover_image_url ? (
          <img
            src={course.cover_image_url}
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}

        {/* Placeholder for missing or broken images */}
        <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${course.cover_image_url ? "hidden" : ""}`}>
          <div className="text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No Image</p>
          </div>
        </div>

        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">{getStatusBadges(course)}</div>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-800">
            {formatPrice(course.price)}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold line-clamp-2">{course.title || "Untitled Course"}</CardTitle>
        <CardDescription className="line-clamp-2">{course.description || "No description available"}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {course.category_name && (
          <div className="text-sm text-gray-600 mb-3">
            <Badge variant="outline" className="text-xs">
              {course.category_name}
            </Badge>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600 gap-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{course.course_duration} jam</span>
          </div>
          <div className="flex items-center">
            <Globe className="w-4 h-4 mr-1" />
            <span>{course.language}</span>
          </div>
        </div>

        {course.admin_review && (
          <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
            <strong>Admin Review:</strong>
            <p className="mt-1 text-xs">{course.admin_review}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-0">
        <div className="space-x-2">
          <Button variant="outline" size="sm">
            <Link href={`/l/course/${course.id}`}>Lihat</Link>
          </Button>
          <Button variant="default" size="sm">
            <Link href={`/l/course/${course.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  const EmptyState = ({ filter }: { filter: FilterValue }) => {
    const messages: Record<FilterValue, string> = {
      "need-review": "Tidak ada kelas yang perlu diulas",
      published: "Tidak ada kelas yang dipublikasi",
      reviewed: "Tidak ada kelas yang sudah diulas",
      draft: "Tidak ada draf kelas",
      all: "Belum ada kelas yang dibuat",
    };

    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{messages[filter]}</h3>
        <p className="text-gray-500 mb-4">{filter === "all" ? "Mulai dengan membuat kelas baru" : "Coba filter lain atau buat kelas baru"}</p>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kelas
        </Button>
      </div>
    );
  };

  return (
    <div className="px-4 lg:px-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kelas</h1>
        <Button className="bg-[#000000] hover:bg-[#000000] text-white cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kelas
        </Button>
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FilterValue)} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="px-2 sm:px-4 cursor-pointer">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Urutkan:</span>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortValue)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <span>Memuat kelas...</span>
              </div>
            ) : courses.length === 0 ? (
              <EmptyState filter={tab.value} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {courses.length > 0 && !loading && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Menampilkan {courses.length} kelas
            {activeTab !== "all" && ` dalam ${tabs.find((t) => t.value === activeTab)?.label.toLowerCase()}`}
          </p>
        </div>
      )}
    </div>
  );
}
