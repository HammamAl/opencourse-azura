import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
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

function enhanceHTMLWithTailwind(html: string): string {
  const $ = load(html);

  $("h1").addClass("text-2xl font-bold mt-6 mb-4");
  $("h2").addClass("text-xl font-semibold mt-5 mb-3");
  $("h3").addClass("text-l font-semibold mt-4 mb-2");
  $("p").addClass("mb-4");
  $("a").addClass("text-blue-600 hover:underline");
  $("ul").addClass("list-disc pl-6 mb-4");
  $("ol").addClass("list-decimal pl-6 mb-4");
  $("li").addClass("mb-2");
  $("blockquote").addClass("border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4");
  $("pre").addClass("bg-gray-900 text-white p-4 rounded overflow-x-auto my-4");
  $("code").each((_, el) => {
    if ($(el).parent().is("pre")) return; 
    $(el).addClass("bg-gray-100 px-1 py-0.5 rounded");
  });
  $("hr").addClass("my-8 border-t border-gray-300");
  $("img").addClass("rounded-md shadow mt-4 mb-4 max-w-full h-auto");

  // Task lists styling
  $('ul[data-type="taskList"]').addClass("list-none pl-0");
  $('li[data-type="taskItem"]').addClass("flex items-start gap-2 mb-2");
  $('li[data-type="taskItem"] input[type="checkbox"]').addClass("mt-1");

  return $.html();
}

async function getCourseMaterialWithNavigation(courseId: string, sectionId: string, materialId: string) {
  const section = await prisma.course_section.findUnique({
    where: {
      id: sectionId,
      deleted_at: null,
    },
    include: {
      course: true,
      course_material: {
        where: { deleted_at: null },
        orderBy: { created_at: "asc" },
      },
    },
  });

  if (!section || !section.course || section.course.deleted_at !== null) {
    notFound();
  }

  if (section.course_id !== courseId) {
    notFound();
  }

  const material = section.course_material.find((m) => m.id === materialId);

  if (!material) {
    notFound();
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

interface MaterialDetailsPageProps {
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

export default async function MaterialDetailsPage({ params }: MaterialDetailsPageProps) {
  const { courseId, sectionId, materialId } = await params;
  const { material, course, section, navigation } = await getCourseMaterialWithNavigation(courseId, sectionId, materialId);

  let htmlContent = "<p>This material has no content yet.</p>";
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
      htmlContent = "<p>Error rendering content.</p>";
    }
  }

  const youtubeVideoResult = material.youtube_link ? getVideoId(material.youtube_link) : null;
  const youtubeVideoId = youtubeVideoResult?.service === "youtube" ? youtubeVideoResult.id : null;

  return (
    <div className="container mx-auto px-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <NextLink href="/l/course">Course</NextLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <NextLink href={`/l/course/${courseId}`}>{course.title}</NextLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>{section.title}</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{material.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Progress indicator */}
        <div className="mt-2 text-sm text-gray-500">
          Materi {navigation.current} dari {navigation.total}
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6">{material.title}</h1>

      {/* YouTube Video Embed */}
      {youtubeVideoId && (
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-4xl">
            <div className="aspect-video">
              <iframe
                className="rounded-lg shadow-lg w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      <div className="tiptap-content prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
        <div className="flex-1">
          {navigation.previous && (
            <NextLink
              href={`/l/course/${courseId}/${sectionId}/${navigation.previous.id}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <IconArrowNarrowLeft />
              Previous: {navigation.previous.title}
            </NextLink>
          )}
        </div>

        <div className="flex-1 text-center">
          <span className="text-sm text-gray-500">
            {navigation.current} of {navigation.total}
          </span>
        </div>

        <div className="flex-1 text-right">
          {navigation.next && (
            <NextLink
              href={`/l/course/${courseId}/${sectionId}/${navigation.next.id}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next: {navigation.next.title}
              <IconArrowNarrowRight />
            </NextLink>
          )}
        </div>
      </div>
    </div>
  );
}
