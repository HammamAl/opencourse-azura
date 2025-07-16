"use client";
import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { YouTubeVideo } from "./Youtube";
import { useCourseInputStore } from "@/store/inputCourse";
import { Plus } from "lucide-react";

// Types
interface EditorRef {
  getContent: () => string;
}

interface MaterialData {
  title: string;
  content: string;
  youtube_link?: string;
}

export default function CreateMaterialPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionId = searchParams.get("section_id");
  const { addMaterial } = useCourseInputStore();

  // State management
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showYouTubeInput, setShowYouTubeInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<EditorRef>(null);

  // Computed values
  const isSaveDisabled = !title.trim() || isSaving;
  const hasYouTubeVideo = showYouTubeInput || youtubeUrl;

  // Event handlers
  const handleSave = async () => {
    if (!validateBeforeSave()) return;

    setIsSaving(true);
    try {
      const materialData = prepareMaterialData();
      addMaterial(sectionId!, materialData);
      router.back();
    } catch (error) {
      console.error("Failed to save material:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleYouTubeUrlChange = (url: string) => {
    setYoutubeUrl(url);
    if (url) {
      setShowYouTubeInput(true);
    }
  };

  const handleRemoveYouTube = () => {
    setYoutubeUrl("");
    setShowYouTubeInput(false);
  };

  const handleGoBack = () => {
    router.back();
  };

  // Helper functions
  const validateBeforeSave = (): boolean => {
    if (!sectionId) {
      console.error("Save failed: Section ID is missing.");
      return false;
    }

    if (!editorRef.current) {
      console.error("Editor ref is not available.");
      return false;
    }

    return true;
  };

  const prepareMaterialData = (): MaterialData => {
    const content = editorRef.current!.getContent();
    return {
      title,
      content,
      youtube_link: youtubeUrl || undefined,
    };
  };

  // Render helpers
  const renderErrorState = () => (
    <div className="max-w-4xl mx-auto p-8 text-center bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Kesalahan</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-6">Kembali ke Kelas dan coba lagi</p>
      <button onClick={handleGoBack} className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors">
        Kembali
      </button>
    </div>
  );

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buat materi</h1>
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaveDisabled}
          className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          onClick={handleGoBack}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors"
        >
          Kembali
        </button>
      </div>
    </div>
  );

  const renderTitleInput = () => (
    <div className="mb-6">
      <label htmlFor="materialTitle" className="sr-only">
        Material Title
      </label>
      <input
        id="materialTitle"
        type="text"
        placeholder="Masukkan judul..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-2xl p-3 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
      />
    </div>
  );

  const renderYouTubeSection = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Video YouTube (Opsional)</h2>

        {!hasYouTubeVideo && (
          <button
            onClick={() => setShowYouTubeInput(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tambah Video YouTube
          </button>
        )}
      </div>

      {hasYouTubeVideo && (
        <div className="max-w-2xl">
          <YouTubeVideo videoUrl={youtubeUrl} onVideoUrlChange={handleYouTubeUrlChange} onRemove={handleRemoveYouTube} placeholder="Masukkan URL YouTube di sini..." />
        </div>
      )}
    </div>
  );

  const renderContentEditor = () => (
    <div className="mb-6">
      <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">Konten Materi</label>
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <SimpleEditor ref={editorRef} placeholder="Mulai menulis konten materi di sini..." />
      </div>
    </div>
  );

  // Early return for error state
  if (!sectionId) {
    return renderErrorState();
  }

  // Main render
  return (
    <div className="w-full p-6 bg-white dark:bg-gray-900 min-h-screen">
      {renderHeader()}
      {renderTitleInput()}
      {renderYouTubeSection()}
      {renderContentEditor()}
    </div>
  );
}
