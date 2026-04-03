// /src/components/MediaManager.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { Image as ImageIcon, Video, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";

export default function MediaManager() {
  const { t } = useTranslation();
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const handleFileUpload = async (
    exerciseId: number,
    type: "image" | "video",
    file: File,
  ) => {
    // Increased limit to 5MB since Blobs are highly efficient in IndexedDB
    if (file.size > 5 * 1024 * 1024) { 
      alert("File size must be less than 5MB.");
      return;
    }

    setUploadingId(exerciseId);
    try {
      // FIX: Store the actual File/Blob object instead of converting to massive Base64 strings
      if (type === "image") {
        await db.exercises.update(exerciseId, { image_url: file });
      } else {
        await db.exercises.update(exerciseId, { video_link: file });
      }
    } catch (err) {
      console.error("Failed to upload media", err);
      alert("Failed to upload media.");
    } finally {
      setUploadingId(null);
    }
  };

  if (!exercises) return <div className="p-4 text-center">Loading exercises...</div>;

  return (
    <div className="mt-6 bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-primary/5">
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Advanced Media Manager</h3>
        <p className="text-xs text-text-secondary mt-1">Upload custom images or videos (Max 5MB). Stored natively on your device.</p>
      </div>
      <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
        {exercises.map((ex) => (
          <div key={ex.exercise_id} className="flex flex-col sm:flex-row gap-4 p-4 bg-background rounded-xl border border-border items-start sm:items-center justify-between">
            <div className="flex-1">
              <h4 className="font-bold text-text-primary">{t(`exercises.${ex.name_key}`)}</h4>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="file" accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(ex.exercise_id, "image", file);
                  }}
                  disabled={uploadingId === ex.exercise_id}
                />
                <div className={cn("flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors", (ex.image_url instanceof Blob || (typeof ex.image_url === 'string' && !ex.image_url.startsWith("/images/"))) ? "bg-success/10 border-success/20 text-success" : "bg-surface border-border text-text-secondary")}>
                  {ex.image_url instanceof Blob ? <CheckCircle2 size={16} /> : <ImageIcon size={16} />}
                  <span>Image</span>
                </div>
              </div>
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="file" accept="video/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(ex.exercise_id, "video", file);
                  }}
                  disabled={uploadingId === ex.exercise_id}
                />
                <div className={cn("flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors", ex.video_link ? "bg-success/10 border-success/20 text-success" : "bg-surface border-border text-text-secondary")}>
                  {ex.video_link ? <CheckCircle2 size={16} /> : <Video size={16} />}
                  <span>Video</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}