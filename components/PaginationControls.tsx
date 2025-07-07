"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { ReadonlyURLSearchParams } from "next/navigation";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: ReadonlyURLSearchParams;
}

export function PaginationControls({ currentPage, totalPages, baseUrl, searchParams }: PaginationControlsProps) {
  // Function to create URL with page parameter
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 7; // Show up to 7 page numbers

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 4) {
        pages.push("ellipsis");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) {
        pages.push("ellipsis");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-1">
      {/* Previous Button */}
      <Button variant="outline" size="sm" asChild disabled={currentPage === 1} className="h-8 w-8 p-0">
        {currentPage === 1 ? (
          <span className="cursor-not-allowed opacity-50">
            <ChevronLeft className="h-4 w-4" />
          </span>
        ) : (
          <Link href={createPageUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        )}
      </Button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === "ellipsis") {
          return (
            <Button key={`ellipsis-${index}`} variant="ghost" size="sm" disabled className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          );
        }

        const isCurrentPage = page === currentPage;

        return (
          <Button key={page} variant={isCurrentPage ? "default" : "outline"} size="sm" asChild={!isCurrentPage} disabled={isCurrentPage} className={`h-8 w-8 p-0 ${isCurrentPage ? "bg-black text-white hover:bg-gray-800 border-black" : ""}`}>
            {isCurrentPage ? <span>{page}</span> : <Link href={createPageUrl(page)}>{page}</Link>}
          </Button>
        );
      })}

      {/* Next Button */}
      <Button variant="outline" size="sm" asChild disabled={currentPage === totalPages} className="h-8 w-8 p-0">
        {currentPage === totalPages ? (
          <span className="cursor-not-allowed opacity-50">
            <ChevronRight className="h-4 w-4" />
          </span>
        ) : (
          <Link href={createPageUrl(currentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </Button>
    </div>
  );
}
