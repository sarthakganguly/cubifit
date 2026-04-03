import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWorkoutStore, useUIStore, QueueItem } from "../store";
import { Play, Trash2, GripVertical, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, useMediaUrl } from "../lib/utils";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { db } from "../db";

function SortableExerciseItem({ queueItem, onRemove }: { queueItem: QueueItem; onRemove: () => void }) {
  const { t } = useTranslation();
  const { cardFontSize } = useUIStore();
  const exercise = queueItem.exercise;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: queueItem.id });

  const imageUrl = useMediaUrl(exercise.image_url);
  const videoUrl = useMediaUrl(exercise.video_link);

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={cn("flex-shrink-0 w-[250px] h-[400px] snap-center flex flex-col gap-3 p-3 bg-surface border border-border rounded-2xl mr-4", isDragging ? "shadow-lg ring-2 ring-primary opacity-90" : "shadow-sm")}>
      <div className="flex justify-between items-center w-full">
        <button className="touch-none p-1 text-text-secondary cursor-grab active:cursor-grabbing" {...attributes} {...listeners}><GripVertical size={18} /></button>
        <button onClick={onRemove} className="p-1 text-error hover:bg-error/10 rounded-lg transition-colors"><Trash2 size={18} /></button>
      </div>
      <div className="w-full h-1/3 bg-border rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0">
        {videoUrl ? (
          <video src={videoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <img src={imageUrl} alt={t(`exercises.${exercise.name_key}`)} className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-h-0 flex flex-col justify-between">
        <h4 className={cn("font-bold mb-1 line-clamp-2 leading-tight", cardFontSize === "sm" ? "text-sm" : cardFontSize === "lg" ? "text-lg" : "text-base")}>{t(`exercises.${exercise.name_key}`)}</h4>
        <p className={cn("text-text-secondary mb-2 line-clamp-3 leading-snug", cardFontSize === "sm" ? "text-xs" : cardFontSize === "lg" ? "text-base" : "text-sm")}>{t(`exercises.${exercise.description_key}`)}</p>
        <div className="flex flex-col gap-1.5 mt-auto"><span className="text-[10px] px-1.5 py-0.5 bg-surface rounded font-medium w-fit">{exercise.duration_sec}s</span></div>
      </div>
    </div>
  );
}

export default function QueueScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { queue, reorderQueue, removeFromQueue, clearQueue, draftName, setDraftName } = useWorkoutStore();
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const[canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => checkScroll(), 100);
    window.addEventListener("resize", checkScroll);
    return () => { clearTimeout(timer); window.removeEventListener("resize", checkScroll); };
  }, [queue]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -266 : 266;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleSave = async () => {
    if (!draftName.trim() || queue.length === 0) return;
    setIsSaving(true);
    const listId = await db.workout_lists.add({ list_name: draftName, created_at: Date.now(), is_draft: false, total_duration: queue.reduce((acc, q) => acc + q.exercise.duration_sec, 0), exercise_count: queue.length });
    await db.workout_list_exercises.bulkAdd(queue.map((q, i) => ({ list_id: listId as number, exercise_id: q.exercise.exercise_id, position: i })));
    setIsSaving(false);
    navigate("/");
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = queue.findIndex((q) => q.id === active.id);
      const newIndex = queue.findIndex((q) => q.id === over.id);
      reorderQueue(arrayMove(queue, oldIndex, newIndex));
    }
  };

  if (queue.length === 0) return <div className="flex flex-col items-center justify-center h-full text-text-secondary"><Play size={32} className="mb-4" /><p>{t("app.empty_queue")}</p></div>;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-primary/10 rounded-xl p-4 mb-6 border border-primary/20">
        <input value={draftName} onChange={(e) => setDraftName(e.target.value)} className="font-bold text-lg text-text-primary bg-transparent outline-none w-full" placeholder="Workout Name" />
        <p className="text-sm text-primary">Exercises: {queue.length}</p>
      </div>
      <div className="flex justify-between mb-4"><h3 className="font-semibold">{t("app.reorder_instructions")}</h3><div className="flex gap-4"><button onClick={() => navigate("/library")} className="text-xs text-primary font-medium">Add More</button><button onClick={clearQueue} className="text-xs text-error font-medium">Clear All</button></div></div>
      <div className="relative flex-1 min-h-0 flex flex-col">
        {canScrollLeft && <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-surface/90 p-2 rounded-full shadow-lg border border-border text-text-primary hover:bg-background transition-colors"><ChevronLeft size={24} /></button>}
        {canScrollRight && queue && queue.length > 0 && <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-surface/90 p-2 rounded-full shadow-lg border border-border text-text-primary hover:bg-background transition-colors"><ChevronRight size={24} /></button>}
        <div ref={scrollRef} onScroll={checkScroll} className="flex-1 overflow-x-auto py-4 flex snap-x snap-mandatory scrollbar-hide px-4 -mx-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={queue.map((q) => q.id)} strategy={horizontalListSortingStrategy}>
              {queue.map((q) => <SortableExerciseItem key={q.id} queueItem={q} onRemove={() => removeFromQueue(q.id)} />)}
            </SortableContext>
          </DndContext>
        </div>
      </div>
      <div className="sticky bottom-0 mt-auto pt-4 pb-2 bg-background/90 backdrop-blur-md flex gap-3 -mx-4 px-4">
        <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-surface text-text-primary py-4 rounded-xl font-bold border border-border shadow-sm">{isSaving ? "Saving..." : t("app.save_list")}</button>
        <button onClick={() => navigate("/workout")} className="flex-[2] bg-primary text-white py-4 rounded-xl font-bold shadow-lg">{t("app.start_workout")}</button>
      </div>
    </div>
  );
}