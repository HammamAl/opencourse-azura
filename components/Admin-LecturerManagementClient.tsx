"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { SearchForm } from "@/components/Admin-SearchFormLecturer";
import { EnhancedPaginationLink } from "@/components/Admin-LecturerPaginationLink";
import { Button } from "@/components/ui/button";
import { LecturerDetailModal } from "@/components/Admin-ViewLecturerDetailModal";
import { UpdateLecturerModal } from "@/components/Admin-EditLecturerDetailModal";
import { DeleteLecturerModal } from "@/components/Admin-DeleteLecturerModal";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PAGE_SIZE } from "@/app/(dash)/a/user-management/lecturer/const";

interface Lecturer {
  id: string;
  full_name: string;
  nidn_number: string | null;
  email: string | null;
  created_at: Date;
}

interface LecturerManagementClientProps {
  lecturers: Lecturer[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    PAGE_SIZE: number;
  };
  keyword: string | null;
}

export function LecturerManagementClient({
  lecturers,
  pagination,
  keyword
}: LecturerManagementClientProps) {
  const router = useRouter();
  const [selectedLecturerId, setSelectedLecturerId] = useState<string | null>(null);
  const [selectedLecturerName, setSelectedLecturerName] = useState<string>("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { totalPages, totalCount, currentPage } = pagination;

  const handleViewLecturer = (lecturerId: string) => {
    setSelectedLecturerId(lecturerId);
    setIsDetailModalOpen(true);
  };

  const handleEditLecturer = (lecturerId: string) => {
    setSelectedLecturerId(lecturerId);
    setIsEditModalOpen(true);
  };

  const handleDeleteLecturer = (lecturerId: string, lecturerName: string) => {
    setSelectedLecturerId(lecturerId);
    setSelectedLecturerName(lecturerName);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedLecturerId(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedLecturerId(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedLecturerId(null);
    setSelectedLecturerName("");
  };

  // Callback function to refresh data when modal operations are successful
  const handleRefreshData = () => {
    router.refresh();
  };

  const createPageLink = (page: number) => {
    // Preserve keyword in pagination links
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (keyword) {
      params.set('keyword', keyword);
    }

    return (
      <PaginationItem key={page}>
        <EnhancedPaginationLink
          href={`?${params.toString()}`}
          isActive={page === currentPage}
        >
          {page}
        </EnhancedPaginationLink>
      </PaginationItem>
    );
  };

  const renderPageLinks = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => createPageLink(i + 1));
    }

    const pages = [];
    const leftBound = Math.max(2, currentPage - 1);
    const rightBound = Math.min(totalPages - 1, currentPage + 1);

    // Always show page 1
    pages.push(createPageLink(1));

    // Left ellipsis
    if (leftBound > 2) {
      pages.push(<PaginationItem key="left-ellipsis"><PaginationEllipsis /></PaginationItem>);
    }

    // Middle pages
    for (let i = leftBound; i <= rightBound; i++) {
      pages.push(createPageLink(i));
    }

    // Right ellipsis
    if (rightBound < totalPages - 1) {
      pages.push(<PaginationItem key="right-ellipsis"><PaginationEllipsis /></PaginationItem>);
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(createPageLink(totalPages));
    }

    return pages;
  };

  const createNavigationLink = (page: number) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (keyword) {
      params.set('keyword', keyword);
    }
    return `?${params.toString()}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6 px-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dosen</h1>
        <Button asChild variant="outline">
          <Link href="/a/user-management/lecturer/add">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Dosen
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-medium">Data Dosen</h2>
        </div>
        <SearchForm keyword={keyword} />
      </div>

      {keyword && (
        <div className="text-sm text-gray-600">
          Menampilkan hasil pencarian untuk "<span className="font-medium">{keyword}</span>"
          - {totalCount} dosen ditemukan {keyword && "(diurutkan berdasarkan relevansi)"}
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>NIDN</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lecturers.length > 0 ? (
              lecturers.map((lecturer, index) => (
                <TableRow key={lecturer.id}>
                  <TableCell className="font-medium">
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                  </TableCell>
                  <TableCell className="font-semibold">{lecturer.full_name}</TableCell>
                  <TableCell className="text-gray-600">{lecturer.nidn_number || '-'}</TableCell>
                  <TableCell className="text-gray-600">{lecturer.email || '-'}</TableCell>
                  <TableCell className="text-gray-600">
                    {formatDate(lecturer.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewLecturer(lecturer.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditLecturer(lecturer.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteLecturer(lecturer.id, lecturer.full_name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {keyword ? `Tidak ada dosen yang ditemukan untuk "${keyword}"` : "Tidak ada data dosen"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {lecturers.length > 0 && (
        <Pagination>
          <PaginationContent>
            {/* Previous Button */}
            <PaginationItem>
              <PaginationPrevious
                href={currentPage > 1 ? createNavigationLink(currentPage - 1) : '#'}
                aria-disabled={currentPage <= 1}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {/* Page Number Links */}
            {renderPageLinks()}

            {/* Next Button */}
            <PaginationItem>
              <PaginationNext
                href={currentPage < totalPages ? createNavigationLink(currentPage + 1) : '#'}
                aria-disabled={currentPage >= totalPages}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Detail Modal */}
      <LecturerDetailModal
        lecturerId={selectedLecturerId}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />

      {/* Edit Modal */}
      <UpdateLecturerModal
        lecturerId={selectedLecturerId}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleRefreshData}
      />

      {/* Delete Modal */}
      <DeleteLecturerModal
        lecturerId={selectedLecturerId}
        lecturerName={selectedLecturerName}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onSuccess={handleRefreshData}
      />
    </div>
  );
}
