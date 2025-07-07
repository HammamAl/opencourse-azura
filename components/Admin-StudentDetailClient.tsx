"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, UserX, UserCheck, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleStudentStatus } from "@/app/(dash)/a/user-management/student/actions";
import { toast } from "sonner";
import Image from "next/image";

interface Student {
  id: string;
  full_name: string;
  email: string;
  created_at: Date;
  deleted_at: Date | null;
  users_profile_picture_url: string | null;
  course_enrollment: {
    course_id: string;
    enrolled_at: Date;
    course: {
      id: string;
      title: string;
      cover_image_url: string | null;
    };
  }[];
  total_courses: number;
}

interface Props {
  student: Student;
}

export function StudentDetailClient({ student }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: "disable" | "enable";
  }>({ isOpen: false, action: "disable" });

  const isActive = !student.deleted_at;

  const handleToggleStatus = (action: "disable" | "enable") => {
    setConfirmDialog({ isOpen: true, action });
  };

  const confirmToggleStatus = async () => {
    const action = confirmDialog.action;

    startTransition(async () => {
      const result = await toggleStudentStatus(student.id, action === "disable");

      if (result.success) {
        toast.success(action === "disable" ? `Siswa ${student.full_name} berhasil dinonaktifkan` : `Siswa ${student.full_name} berhasil diaktifkan`);
        router.refresh();
      } else {
        toast.error(result.error || "Terjadi kesalahan");
      }
    });

    setConfirmDialog({ isOpen: false, action: "disable" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/a/user-management/student">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detail Siswa</h1>
            <p className="text-gray-600">Informasi lengkap siswa</p>
          </div>
        </div>
        <Button variant={isActive ? "destructive" : "default"} onClick={() => handleToggleStatus(isActive ? "disable" : "enable")} disabled={isPending}>
          {isActive ? (
            <>
              <UserX className="h-4 w-4 mr-2" />
              Nonaktifkan User
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4 mr-2" />
              Aktifkan User
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={student.users_profile_picture_url || ""} />
                <AvatarFallback className="text-lg">{getInitials(student.full_name)}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{student.full_name}</h3>
                <p className="text-gray-600">{student.email}</p>
                <p className="text-sm text-gray-500">Mahasiswa</p>
              </div>
              <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Aktif" : "Nonaktif"}</Badge>
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Bergabung:</span>
                <span>{new Date(student.created_at).toLocaleDateString("id-ID")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrolled Courses */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Kelas Yang Diikuti</span>
                <Badge variant="outline">{student.total_courses}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.course_enrollment.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Belum mengikuti kelas apapun</p>
              ) : (
                <div className="space-y-4">
                  {student.course_enrollment.map((enrollment) => (
                    <div key={enrollment.course_id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {enrollment.course.cover_image_url ? (
                          <Image src={enrollment.course.cover_image_url} alt={enrollment.course.title} width={64} height={64} className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{enrollment.course.title}</h4>
                        <p className="text-sm text-gray-600">Bergabung: {new Date(enrollment.enrolled_at).toLocaleDateString("id-ID")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog({ isOpen: open, action: "disable" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.action === "disable" ? "Nonaktifkan" : "Aktifkan"} Siswa</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin {confirmDialog.action === "disable" ? "menonaktifkan" : "mengaktifkan"} akun siswa <strong>{student.full_name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ isOpen: false, action: "disable" })}>
              Tidak
            </Button>
            <Button variant={confirmDialog.action === "disable" ? "destructive" : "default"} onClick={confirmToggleStatus} disabled={isPending}>
              {confirmDialog.action === "disable" ? "Ya, Nonaktifkan" : "Ya, Aktifkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
