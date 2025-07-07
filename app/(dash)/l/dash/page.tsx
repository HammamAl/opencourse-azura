import { CourseMainDashboard } from "@/components/Admin-MainDashboard";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { IconChevronRight, IconDoor, IconList } from "@tabler/icons-react";

export default function Page() {
  return (
    <>
      <SectionCards />
      <h1 className="px-4 lg:px-6 flex items-center gap-2">
        <IconDoor className="w-5 h-5" />
        Daftar Kelas
      </h1>
      <CourseMainDashboard></CourseMainDashboard>
    </>
  );
}
