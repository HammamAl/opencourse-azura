"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface Props {
  courseId: string;
  existingReview?: string;
}

export default function AdminSubmitCourseReview({
  courseId,
  existingReview = "",
}: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [review, setReview] = useState(existingReview);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span>Memuat...</span>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          You are not authorized to submit a review.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/course/${courseId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_review: review }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unknown error");
      }

      setMessage("Ulasan berhasil dikirim");
      setMessageType("success");
      router.refresh();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Beri Ulasan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Tulis catatan kepada pembuat kelas"
          rows={5}
          className="resize-none"
        />

        <Button
          onClick={handleSubmit}
          disabled={loading || !review.trim()}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Mengirim..." : "Perlu Direvisi"}
        </Button>

        {message && (
          <Alert variant={messageType === "error" ? "destructive" : "default"}>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
