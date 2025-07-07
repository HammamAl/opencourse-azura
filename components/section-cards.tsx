import { IconBook, IconChalkboardTeacher, IconDoor, IconTrendingDown, IconTrendingUp, IconUsers } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { prisma } from "@/lib/db"

async function getDashboardCounts() {
  const [courseCount, studentCount, lecturerCount] = await prisma.$transaction([
    prisma.course.count({ where: { status: "published", deleted_at: null } }),
    prisma.users.count({ where: { role: "student" } }),
    prisma.users.count({ where: { role: "lecturer" } })
  ]);
  return { courseCount, studentCount, lecturerCount };
}

export async function SectionCards() {
  const { courseCount, studentCount, lecturerCount } = await getDashboardCounts();

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>

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
