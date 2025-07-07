import { prisma } from "@/lib/db";
import { StudentManagementClient } from "@/components/Admin-StudentManagementClient";
import { softDeleteFilter } from "@/lib/softDelete";

const VALID_PAGE_SIZES = [5, 10, 20, 50] as const;
export type PageSize = (typeof VALID_PAGE_SIZES)[number];

function calculateRelevanceScore(student: any, keyword: string) {
  let score = 0;

  if (student.email === keyword) {
    score += 100;
  } else if (student.email?.startsWith(keyword)) {
    score += 50;
  } else if (student.email?.includes(keyword)) {
    score += 25;
  }

  if (student.full_name?.toLowerCase().includes(keyword.toLowerCase())) {
    score += 10;
  }

  return score;
}

async function getPaginatedStudentData(page: number = 1, keyword: string | null, pageSize: PageSize = 5) {
  const safePage = Math.max(page, 1);
  const safePageSize = VALID_PAGE_SIZES.includes(pageSize) ? pageSize : 5;

  let studentWhere: any = { role: "student" };
  let orderBy: any = { created_at: "asc" };
  let shouldSortByRelevance = false;

  const trimmedKeyword = keyword?.trim();
  if (trimmedKeyword) {
    studentWhere = {
      ...studentWhere,
      OR: [{ full_name: { contains: trimmedKeyword, mode: "insensitive" } }, { email: { contains: trimmedKeyword, mode: "insensitive" } }],
    };
    shouldSortByRelevance = true;
  }

  const activeWhere = softDeleteFilter(new Date(), studentWhere);
  const inactiveWhere = { ...studentWhere, deleted_at: { not: null } };
  const allWhere = studentWhere;

  if (shouldSortByRelevance) {
    const [allData, totalCount] = await Promise.all([
      prisma.users.findMany({
        where: allWhere,
        select: {
          id: true,
          full_name: true,
          email: true,
          created_at: true,
          deleted_at: true,
          course_enrollment: {
            select: {
              course_id: true,
            },
          },
        },
      }),
      prisma.users.count({
        where: allWhere,
      }),
    ]);

    const sortedData = allData.sort((a, b) => {
      const scoreA = calculateRelevanceScore(a, trimmedKeyword!);
      const scoreB = calculateRelevanceScore(b, trimmedKeyword!);

      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    const skip = (safePage - 1) * safePageSize;
    const paginatedData = sortedData.slice(skip, skip + safePageSize);

    const totalPages = Math.ceil(totalCount / safePageSize);

    return {
      data: paginatedData,
      pagination: {
        totalCount,
        totalPages,
        currentPage: safePage,
        pageSize: safePageSize,
      },
    };
  } else {
    const skip = (safePage - 1) * safePageSize;

    const [data, totalCount] = await Promise.all([
      prisma.users.findMany({
        skip,
        take: safePageSize,
        where: allWhere,
        orderBy,
        select: {
          id: true,
          full_name: true,
          email: true,
          created_at: true,
          deleted_at: true,
          course_enrollment: {
            select: {
              course_id: true,
            },
          },
        },
      }),
      prisma.users.count({
        where: allWhere,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / safePageSize);

    return {
      data,
      pagination: {
        totalCount,
        totalPages,
        currentPage: safePage,
        pageSize: safePageSize,
      },
    };
  }
}

export default async function StudentManagement({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;

  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const pageSize = (Number(resolvedSearchParams?.pageSize) as PageSize) || 5;

  const rawKeyword = resolvedSearchParams?.keyword;
  const keyword = Array.isArray(rawKeyword) ? rawKeyword[0] : rawKeyword || null;

  const { data: students, pagination } = await getPaginatedStudentData(currentPage, keyword, pageSize);

  const formattedStudents = students.map((student) => ({
    ...student,
    email: student.email ?? "",
  }));

  return <StudentManagementClient students={formattedStudents} pagination={pagination} keyword={keyword} validPageSizes={VALID_PAGE_SIZES} />;
}
