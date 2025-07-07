import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/authOptions"

import { IconChalkboardTeacher, IconDoor, IconUsers } from "@tabler/icons-react"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/db"

// Your data fetching functions remain the same
async function getPublishedClassCount(lecturer_id: string) {
  const count = await prisma.course.count({
    where: { status: "published", lecturer_id },
  })
  return count
}

async function getStudentsCount(lecturer_id: string) {
  const coursesWithEnrollmentCount = await prisma.course.findMany({
    where: { status: "published", lecturer_id },
    include: {
      _count: {
        select: {
          course_enrollment: true,
        },
      },
    },
  })

  const totalStudentsEnrollmentCount = coursesWithEnrollmentCount.reduce(
    (total, course) => total + course._count.course_enrollment,
    0
  )

  return totalStudentsEnrollmentCount
}

async function getLecturersCount() {
  const count = await prisma.users.count({
    where: { role: "lecturer" },
  })
  return count
}

// We use async Server Component
export async function SectionCards() {
  // 1. Fetch the session on the server
  const session = await getServerSession(authOptions)

  // 2. Add a check for the session. This satisfies TypeScript and handles edge cases.
  if (!session?.user?.id) {
    // Or render a message, a login button, etc.
    // Returning null is fine if your page/layout handles the redirect.
    return null
  }

  const lecturerId = session.user.id

  // 3. Fetch all data in parallel for better performance
  const [courseCount, studentCount, lecturerCount] = await Promise.all([
    getPublishedClassCount(lecturerId),
    getStudentsCount(lecturerId),
    getLecturersCount(),
  ])

  return (
    <div
      className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}
    >
      <Card className="@container/card">
        <CardHeader className="relative">
          <IconDoor className="absolute top-1/2 right-4 h-8 w-8 -translate-y-1/2 text-muted-foreground" />
          <CardDescription>Kelas Terpublikasi</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {courseCount}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <IconUsers className="absolute top-1/2 right-4 h-8 w-8 -translate-y-1/2 text-muted-foreground" />
          <CardDescription>Jumlah Siswa</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {studentCount}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="@container/card">
        <CardHeader className="relative">
          <IconChalkboardTeacher className="absolute top-1/2 right-4 h-8 w-8 -translate-y-1/2 text-muted-foreground" />
          <CardDescription>Jumlah Dosen</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {lecturerCount}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
