"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Eye, UserX, UserCheck, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PaginationControls } from "@/components/PaginationControls";
import { toggleStudentStatus } from "@/app/(dash)/a/user-management/student/actions";
import { toast } from "sonner";
import { AddStudentModal } from "@/components/Admin-AddStudentModal";

interface Student {
  id: string;
  full_name: string;
  email: string;
  created_at: Date;
  deleted_at: Date | null;
  course_enrollment: { course_id: string }[];
}

interface Pagination {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface Props {
  students: Student[];
  pagination: Pagination;
  keyword: string | null;
  validPageSizes: readonly number[];
}

export function StudentManagementClient({ students, pagination, keyword, validPageSizes }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(keyword || "");
  const [isSearching, setIsSearching] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0); // Key to force modal reset
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    student: Student | null;
    action: "disable" | "enable";
  }>({ isOpen: false, student: null, action: "disable" });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    const params = new URLSearchParams(searchParams);

    if (searchTerm.trim()) {
      params.set("keyword", searchTerm.trim());
    } else {
      params.delete("keyword");
    }
    params.set("page", "1");

    startTransition(() => {
      router.push(`/a/user-management/student?${params.toString()}`);
      setIsSearching(false);
    });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setIsSearching(true);

    const params = new URLSearchParams(searchParams);
    params.delete("keyword");
    params.set("page", "1");

    startTransition(() => {
      router.push(`/a/user-management/student?${params.toString()}`);
      setIsSearching(false);
    });
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("pageSize", newPageSize);
    params.set("page", "1");

    startTransition(() => {
      router.push(`/a/user-management/student?${params.toString()}`);
    });
  };

  const handleToggleStatus = async (student: Student, action: "disable" | "enable") => {
    setConfirmDialog({ isOpen: true, student, action });
  };

  const confirmToggleStatus = async () => {
    if (!confirmDialog.student) return;

    const student = confirmDialog.student;
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

    setConfirmDialog({ isOpen: false, student: null, action: "disable" });
  };

  const handleAddStudentSuccess = () => {
    router.refresh(); // Refresh the page to show new student
  };

  const handleOpenAddModal = () => {
    setModalKey((prev) => prev + 1); // Force modal to reset completely
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Siswa</h1>
          <p className="text-gray-600">Kelola data siswa dalam sistem</p>
        </div>
        <Button onClick={handleOpenAddModal} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Siswa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Siswa</CardTitle>

          {/* Control Bar with Page Size Selector (Left) and Search (Right) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Left Section - Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Tampilkan</span>
              <Select value={pagination.pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {validPageSizes.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">data per halaman</span>
            </div>

            {/* Right Section - Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="text" placeholder="Cari nama atau email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
              </div>
              <Button type="submit" variant="outline" size="sm" disabled={isSearching || isPending}>
                {isSearching ? "Mencari..." : "Cari"}
              </Button>
              {keyword && (
                <Button type="button" variant="outline" size="sm" onClick={handleClearSearch} disabled={isSearching || isPending}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
            </form>
          </div>

          {/* Search Results Info */}
          {keyword && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Menampilkan hasil pencarian untuk: <strong>"{keyword}"</strong>
                {pagination.totalCount > 0 ? <span> - Ditemukan {pagination.totalCount} siswa</span> : <span> - Tidak ada siswa yang ditemukan</span>}
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Jumlah Kelas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {keyword ? "Tidak ada siswa yang ditemukan" : "Belum ada data siswa"}
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student, index) => {
                    const rowNumber = (pagination.currentPage - 1) * pagination.pageSize + index + 1;
                    const isActive = !student.deleted_at;

                    return (
                      <TableRow key={student.id}>
                        <TableCell>{rowNumber}</TableCell>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.course_enrollment.length}</TableCell>
                        <TableCell>
                          <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Aktif" : "Nonaktif"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                              <Link href={`/a/user-management/student/${student.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleToggleStatus(student, isActive ? "disable" : "enable")} disabled={isPending}>
                              {isActive ? <UserX className="h-4 w-4 text-red-600" /> : <UserCheck className="h-4 w-4 text-green-600" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Info and Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 space-y-4">
              {/* Pagination Info */}
              <div className="text-sm text-gray-600 text-center">
                Menampilkan {(pagination.currentPage - 1) * pagination.pageSize + 1} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} dari {pagination.totalCount} siswa
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center">
                <PaginationControls currentPage={pagination.currentPage} totalPages={pagination.totalPages} baseUrl="/a/user-management/student" searchParams={searchParams} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Modal */}
      <AddStudentModal
        key={modalKey} // Force complete modal reset
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleAddStudentSuccess}
      />

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog({ isOpen: open, student: null, action: "disable" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.action === "disable" ? "Nonaktifkan" : "Aktifkan"} Siswa</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin {confirmDialog.action === "disable" ? "menonaktifkan" : "mengaktifkan"} akun siswa <strong>{confirmDialog.student?.full_name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ isOpen: false, student: null, action: "disable" })}>
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
