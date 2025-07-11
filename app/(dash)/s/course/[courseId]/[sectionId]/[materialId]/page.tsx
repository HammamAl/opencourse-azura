import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { generateHTML } from "@tiptap/html";
import { JSONContent } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Blockquote from "@tiptap/extension-blockquote";
import HardBreak from "@tiptap/extension-hard-break";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { JsonValue } from "@prisma/client/runtime/library";
import { load } from "cheerio";
import NextLink from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";
import getVideoId from "get-video-id";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

function enhanceHTMLWithTailwind(html: string): string {
  const $ = load(html);

  $("h1").addClass("text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100");
  $("h2").addClass("text-xl font-semibold mt-5 mb-3 text-gray-900 dark:text-gray-100");
  $("h3").addClass("text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100");
  $("p").addClass("mb-4 text-gray-700 dark:text-gray-300 leading-relaxed");
  $("a").addClass("text-blue-600 hover:underline dark:text-blue-400");
  $("ul").addClass("list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300");
  $("ol").addClass("list-decimal pl-6 mb-4 text-gray-700 dark:text-gray-300");
  $("li").addClass("mb-2");
  $("blockquote").addClass("border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-4 bg-gray-50 dark:bg-gray-800 py-2");
  $("pre").addClass("bg-gray-900 dark:bg-gray-800 text-white p-4 rounded overflow-x-auto my-4");
  $("code").each((_, el) => {
    if ($(el).parent().is("pre")) return;
    $(el).addClass("bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm text-gray-800 dark:text-gray-200");
  });
  $("hr").addClass("my-8 border-t border-gray-300 dark:border-gray-600");
  $("img").addClass("rounded-md shadow mt-4 mb-4 max-w-full h-auto");

  // Task lists styling
  $('ul[data-type="taskList"]').addClass("list-none pl-0");
  $('li[data-type="taskItem"]').addClass("flex items-start gap-2 mb-2");
  $('li[data-type="taskItem"] input[type="checkbox"]').addClass("mt-1");

  return $.html();
}

async function getCourseMaterialWithNavigationForStudent(courseId: string, sectionId: string, materialId: string, studentId: string) {
  // First check if student is enrolled in this course
  const enrollment = await prisma.course_enrollment.findFirst({
    where: {
      id: studentId,
      course_id: courseId,
      delisted_at: null,
    },
  });

  if (!enrollment) {
    return null; // Student not enrolled
  }

  const section = await prisma.course_section.findUnique({
    where: {
      id: sectionId,
      deleted_at: null,
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          deleted_at: true,
        },
      },
      course_material: {
        where: { deleted_at: null },
        orderBy: { created_at: "asc" },
        select: {
          id: true,
          title: true,
          content: true,
          youtube_link: true,
          created_at: true,
          course_section_id: true,
        },
      },
    },
  });

  if (!section || !section.course || section.course.deleted_at !== null) {
    return null;
  }

  if (section.course.id !== courseId) {
    return null;
  }

  const material = section.course_material.find((m) => m.id === materialId);

  if (!material) {
    return null;
  }

  const allMaterials = section.course_material.map((m) => ({
    id: m.id,
    title: m.title,
  }));

  const currentIndex = allMaterials.findIndex((m) => m.id === materialId);
  const previousMaterial = currentIndex > 0 ? allMaterials[currentIndex - 1] : null;
  const nextMaterial = currentIndex < allMaterials.length - 1 ? allMaterials[currentIndex + 1] : null;

  return {
    material,
    course: section.course,
    section,
    navigation: {
      previous: previousMaterial,
      next: nextMaterial,
      current: currentIndex + 1,
      total: allMaterials.length,
    },
  };
}

interface StudentMaterialDetailsPageProps {
  params: Promise<{
    courseId: string;
    sectionId: string;
    materialId: string;
  }>;
}

function isValidJSONContent(value: JsonValue): value is JSONContent {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return isValidJSONContent(parsed);
    } catch {
      return false;
    }
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const obj = value as Record<string, any>;

  if (!obj.type || typeof obj.type !== "string") {
    return false;
  }

  if (obj.content && !Array.isArray(obj.content)) {
    return false;
  }

  return true;
}

export default async function StudentMaterialDetailsPage({ params }: StudentMaterialDetailsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "student") {
    redirect("/unauthorized");
  }

  const { courseId, sectionId, materialId } = await params;
  const result = await getCourseMaterialWithNavigationForStudent(courseId, sectionId, materialId, session.user.id);

  if (!result) {
    notFound();
  }

  const { material, course, section, navigation } = result;

  let htmlContent = "<p class='text-gray-500 dark:text-gray-400 italic'>Materi ini belum memiliki konten.</p>";
  let contentToRender: JSONContent | null = null;

  if (typeof material.content === "string") {
    try {
      contentToRender = JSON.parse(material.content);
    } catch (error) {
      console.error("Error parsing JSON content:", error);
    }
  } else if (isValidJSONContent(material.content)) {
    contentToRender = material.content;
  }

  if (contentToRender) {
    try {
      const extensions = [
        // Core document structure
        Document,
        Paragraph,
        Text,

        // Basic formatting
        Bold,
        Italic,
        Strike,
        Code,
        Underline,

        // Block elements
        Heading,
        CodeBlock,
        Blockquote,
        HardBreak,
        HorizontalRule,

        // Lists
        BulletList,
        OrderedList,
        ListItem,
        TaskList,
        TaskItem.configure({ nested: true }),

        // Advanced formatting
        Highlight.configure({ multicolor: true }),
        Superscript,
        Subscript,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Typography,

        // Media & Links
        Image,
        Link.configure({ openOnClick: false }),
      ];

      htmlContent = enhanceHTMLWithTailwind(generateHTML(contentToRender, extensions));
    } catch (error) {
      console.error("Error generating HTML from content:", error);
      htmlContent = "<p class='text-red-500'>Error rendering content.</p>";
    }
  }

  const youtubeVideoResult = material.youtube_link ? getVideoId(material.youtube_link) : null;
  const youtubeVideoId = youtubeVideoResult?.service === "youtube" ? youtubeVideoResult.id : null;

  return (
    <div className="px-4 lg:px-6">
      <div className="container mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <NextLink href="/s">Dashboard</NextLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <NextLink href={`/s/course/${courseId}`}>{course.title}</NextLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="text-gray-600 dark:text-gray-400">{section.title}</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-gray-900 dark:text-gray-100">{material.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Progress indicator */}
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Materi {navigation.current} dari {navigation.total}
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">{material.title}</h1>

        {/* YouTube Video Embed */}
        {youtubeVideoId && (
          <div className="mb-8 flex justify-center">
            <div className="relative w-full max-w-4xl">
              <div className="aspect-video">
                <iframe
                  className="rounded-lg shadow-lg w-full h-full"
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                  title={material.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="tiptap-content prose prose-lg max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            {navigation.previous && (
              <NextLink
                href={`/s/course/${courseId}/${sectionId}/${navigation.previous.id}`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                <IconArrowNarrowLeft className="mr-2" />
                <span className="hidden sm:inline">Sebelumnya: </span>
                <span className="truncate max-w-[150px] sm:max-w-none">{navigation.previous.title}</span>
              </NextLink>
            )}
          </div>

          <div className="flex-1 text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {navigation.current} dari {navigation.total}
            </span>
          </div>

          <div className="flex-1 text-right">
            {navigation.next && (
              <NextLink
                href={`/s/course/${courseId}/${sectionId}/${navigation.next.id}`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                <span className="hidden sm:inline">Selanjutnya: </span>
                <span className="truncate max-w-[150px] sm:max-w-none">{navigation.next.title}</span>
                <IconArrowNarrowRight className="ml-2" />
              </NextLink>
            )}
          </div>
        </div>

        {/* Back to Course Button */}
        <div className="mt-8 mb-6 text-center">
          <NextLink
            href={`/s/course/${courseId}`}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-900/30"
          >
            Kembali ke Kelas
          </NextLink>
        </div>
      </div>
    </div>
  );
}
