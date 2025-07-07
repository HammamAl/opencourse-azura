import { prisma } from "@/lib/db";
import { LecturerManagementClient } from "@/components/Admin-LecturerManagementClient";
import { softDeleteFilter } from "@/lib/softDelete";
import { PAGE_SIZE } from "./const";

function calculateRelevanceScore(lecturer: any, keyword: string) {
  let score = 0;

  if (lecturer.nidn_number === keyword) {
    score += 100;
  } else if (lecturer.nidn_number?.startsWith(keyword)) {
    score += 50;
  } else if (lecturer.nidn_number?.includes(keyword)) {
    score += 25;
  }

  if (lecturer.full_name?.toLowerCase().includes(keyword.toLowerCase())) {
    score += 10;
  }

  return score;
}

async function getPaginatedLecturerData(page: number = 1, keyword: string | null) {
  const safePage = Math.max(page, 1);

  let lecturerWhere: any = { role: 'lecturer' };
  let orderBy: any = { created_at: 'desc' };
  let shouldSortByRelevance = false;

  const trimmedKeyword = keyword?.trim();
  if (trimmedKeyword) {
    const isNumeric = /^\d+$/.test(trimmedKeyword);
    if (isNumeric) {
      lecturerWhere = {
        ...lecturerWhere,
        OR: [
          { nidn_number: { startsWith: trimmedKeyword } },
          { full_name: { contains: trimmedKeyword, mode: 'insensitive' } }
        ]
      };
      shouldSortByRelevance = true;
    } else {
      lecturerWhere.full_name = {
        contains: trimmedKeyword,
        mode: 'insensitive'
      };
    }
  }

  const where = softDeleteFilter(new Date(), lecturerWhere);

  if (shouldSortByRelevance) {
    const [allData, totalCount] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          id: true,
          full_name: true,
          nidn_number: true,
          email: true,
          created_at: true,
        }
      }),
      prisma.users.count({
        where,
      }),
    ]);

    const sortedData = allData.sort((a, b) => {
      const scoreA = calculateRelevanceScore(a, trimmedKeyword!);
      const scoreB = calculateRelevanceScore(b, trimmedKeyword!);

      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      return a.full_name.localeCompare(b.full_name);
    });

    const skip = (safePage - 1) * PAGE_SIZE;
    const paginatedData = sortedData.slice(skip, skip + PAGE_SIZE);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return {
      data: paginatedData,
      pagination: {
        totalCount,
        totalPages,
        currentPage: safePage,
        PAGE_SIZE,
      },
    };
  } else {
    const skip = (safePage - 1) * PAGE_SIZE;

    const [data, totalCount] = await Promise.all([
      prisma.users.findMany({
        skip,
        take: PAGE_SIZE,
        where,
        orderBy,
        select: {
          id: true,
          full_name: true,
          nidn_number: true,
          email: true,
          created_at: true,
        }
      }),
      prisma.users.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return {
      data,
      pagination: {
        totalCount,
        totalPages,
        currentPage: safePage,
        PAGE_SIZE,
      },
    };
  }
}

export default async function LecturerManagement({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  const currentPage = Number(resolvedSearchParams?.page) || 1;

  const rawKeyword = resolvedSearchParams?.keyword;
  const keyword = Array.isArray(rawKeyword) ? rawKeyword[0] : rawKeyword || null;

  const { data: lecturers, pagination } = await getPaginatedLecturerData(currentPage, keyword);

  return (
    <LecturerManagementClient
      lecturers={lecturers}
      pagination={pagination}
      keyword={keyword}
    />
  );
}
