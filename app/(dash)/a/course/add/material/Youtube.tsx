"use client";
import { useState } from "react";
import { Edit, Play, X } from "lucide-react";

// --- Custom Hook for YouTube Logic ---
const useYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;

  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/, /youtube\.com\/watch\?.*v=([^&\n?#]+)/];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

interface YouTubeVideoPlayerProps {
  videoId: string;
  videoUrl: string;
  onEdit: () => void;
  onRemove?: () => void;
}

function YouTubeVideoPlayer({ videoId, videoUrl, onEdit, onRemove }: YouTubeVideoPlayerProps) {
  return (
    <div className="relative group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="relative aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
        />
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2 bg-blue-500 bg-opacity-90 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg" title="Edit video">
            <Edit />
          </button>
          {onRemove && (
            <button onClick={onRemove} className="p-2 bg-red-500 bg-opacity-90 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-lg" title="Remove video">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">YouTube Video</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{videoUrl}</p>
      </div>
    </div>
  );
}

interface YouTubeVideoFormProps {
  initialUrl: string;
  onSave: (url: string) => void;
  onCancel: () => void;
  placeholder: string;
}

function YouTubeVideoForm({ initialUrl, onSave, onCancel, placeholder }: YouTubeVideoFormProps) {
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const videoId = useYouTubeVideoId(inputUrl);

  const handleSave = () => {
    if (videoId) {
      onSave(inputUrl);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <Play className="h-5 w-5 text-red-500" />
        <span className="font-medium text-gray-900 dark:text-white">Add YouTube Video</span>
      </div>
      <div className="space-y-4">
        <input
          type="url"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={!videoId} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
            Add Video
          </button>
          {initialUrl && (
            <button onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

interface YouTubeVideoProps {
  videoUrl?: string;
  onVideoUrlChange: (url: string) => void;
  onRemove?: () => void;
  placeholder?: string;
}

export function YouTubeVideo({ videoUrl = "", onVideoUrlChange, onRemove, placeholder = "Paste YouTube URL here..." }: YouTubeVideoProps) {
  const [isEditing, setIsEditing] = useState(!videoUrl);
  const videoId = useYouTubeVideoId(videoUrl);

  const handleSave = (newUrl: string) => {
    onVideoUrlChange(newUrl);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing || !videoId) {
    return <YouTubeVideoForm initialUrl={videoUrl} onSave={handleSave} onCancel={handleCancel} placeholder={placeholder} />;
  }

  return <YouTubeVideoPlayer videoId={videoId} videoUrl={videoUrl} onEdit={() => setIsEditing(true)} onRemove={onRemove} />;
}
