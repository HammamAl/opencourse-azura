"use client"

import * as React from "react"
import {
  IconBook,
  IconCamera,
  IconCashRegister,
  IconCategory,
  IconChalkboardTeacher,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconDoor,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconLanguage,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUser,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/a/dash",
      icon: IconDashboard,
    },
    {
      title: "Kelas",
      url: "/a/course",
      icon: IconDoor,
    },
  ],
  manajemenUser: [
    {
      name: "Dosen",
      url: "/a/user-management/lecturer",
      icon: IconChalkboardTeacher,
    },
    {
      name: "Siswa",
      url: "/a/user-management/student",
      icon: IconUser,
    },
  ],
  masterData: [
    {
      name: "Kategori Kelas",
      url: "#",
      icon: IconCategory,
    },
    {
      name: "Bahasa",
      url: "#",
      icon: IconLanguage,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
  ],
}

import { usePathname } from 'next/navigation';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname(); // Get the current URL path

  // Dynamically add 'isActive' to ALL nav items that need it

  const navMainItems = data.navMain.map(item => ({
    ...item,
    isActive: pathname === item.url,
  }));

  const manajemenUserItems = data.manajemenUser.map(item => ({
    ...item,
    isActive: pathname === item.url,
  }));

  const masterDataItems = data.masterData.map(item => ({
    ...item,
    isActive: pathname === item.url,
  }));

  const navSecondaryItems = data.navSecondary.map(item => ({
    ...item,
    isActive: pathname === item.url,
  }));

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarContent>
        {/* Pass the dynamically updated items */}
        <NavMain items={navMainItems} />

        {/* Pass the new arrays to the components */}
        <NavDocuments items={manajemenUserItems} title="Manajemen User" />
        <NavDocuments items={masterDataItems} title="Master Data" />

        <NavSecondary items={navSecondaryItems} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
