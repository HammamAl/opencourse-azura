'use client';

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function PublishCourseButton({ courseId, status }: { courseId: string, status: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handlePublish() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/course/${courseId}/publish`, {
          method: "POST",
          body: JSON.stringify({ courseId }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to publish");

        toast.success("Kelas berhasil dipublikasikan!");
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error("Gagal mempublikasikan kelas");
      }
    });
  }

  const isPublished = status === "published";

  return (
    <Button
      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
      onClick={handlePublish}
      disabled={isPending || isPublished}
    >
      <CheckCircle className="h-5 w-5 mr-2" />
      {isPublished ? "Sudah Dipublikasikan" : "Publikasikan"}
    </Button>
  );
}
