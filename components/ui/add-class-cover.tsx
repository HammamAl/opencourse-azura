"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useCourseInputStore } from "@/store/inputCourse";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, ImagePlus, X } from "lucide-react";

// --- Constants ---
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// --- Sub-components for cleaner JSX ---
const UploadPlaceholder = () => (
  <Label htmlFor="cover-upload" className="flex flex-col items-center justify-center cursor-pointer space-y-2 py-8">
    <ImagePlus className="h-10 w-10 text-gray-400" />
    <span className="text-sm font-medium text-blue-600 hover:text-blue-700">Pilih file cover</span>
    <p className="text-xs text-gray-500">PNG, JPG, WEBP, maks. 5MB</p>
  </Label>
);

/**
 * Renders the preview of the selected or existing image.
 * @param url - The URL of the image to display.
 * @param onRemove - The function to call when the remove button is clicked.
 */
const ImagePreview = ({ url, onRemove }: { url: string; onRemove: () => void }) => (
  <div className="relative group w-full">
    <img src={url} alt="Pratinjau Cover" className="w-full h-40 object-cover rounded-md" />
    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={onRemove} aria-label="Hapus gambar">
      <X className="h-4 w-4" />
    </Button>
  </div>
);

/**
 * A component for uploading a course cover image.
 * It handles file selection, validation, preview, upload, and removal.
 */
export function AddClassCover() {
  const { course, setCourse } = useCourseInputStore();

  // --- State Management ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Side Effects ---
  // Effect to create and clean up the object URL for the image preview.
  // This prevents memory leaks.
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Cleanup function to revoke the object URL when the component unmounts
    // or when the selectedFile changes.
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // --- State Cleanup ---
  /**
   * Resets the component state and clears the file input.
   */
  const resetState = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);

    const input = document.getElementById("cover-upload") as HTMLInputElement;
    if (input) {
      input.value = "";
    }
  }, []);

  // --- Event Handlers ---

  /**
   * Handles the selection of a new file, validates it, and updates the state.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setError(null); // Reset error on new file selection

    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      const message = "Harap pilih file gambar yang valid (PNG, JPG, WEBP).";
      setError(message);
      toast.error(message);
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const message = "Ukuran gambar maksimal adalah 5MB.";
      setError(message);
      toast.error(message);
      return;
    }

    setSelectedFile(file);
  };

  /**
   * Handles removing the currently selected or uploaded image.
   */
  const handleRemoveImage = () => {
    resetState();
    setCourse({ cover_image_url: "" });
    toast.info("Gambar cover telah dihapus.");
  };

  /**
   * Handles the upload process to the server.
   */
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch("/api/course/cover-image", {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengunggah file.");
      }

      setCourse({ cover_image_url: result.cover_image_url });
      toast.success("Cover berhasil diunggah!");
      resetState(); // Clean up local state after successful upload
    } catch (err: any) {
      const errorMessage = err.message || "Terjadi kesalahan. Silakan coba lagi.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Determine which URL to display: the local preview or the saved course image.
  const displayUrl = previewUrl || course.cover_image_url;

  return (
    <div className="space-y-3">
      <h2>Cover Kelas</h2>
      <div className="p-4 border-2 border-dashed rounded-lg text-center space-y-3 bg-gray-50">
        {displayUrl ? <ImagePreview url={displayUrl} onRemove={handleRemoveImage} /> : <UploadPlaceholder />}

        <input id="cover-upload" type="file" accept={ALLOWED_MIME_TYPES.join(",")} className="hidden" onChange={handleFileChange} disabled={isUploading} />
      </div>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full">
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Mengunggah...
          </>
        ) : (
          "Unggah & Simpan Cover"
        )}
      </Button>
    </div>
  );
}
