import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { useWorkoutStore, useUIStore } from "../store";
import { Plus, Check, Search, Filter, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, useMediaUrl } from "../lib/utils";

const FilterPanel = ({ filters, setFilters, muscles, t }: any) => {
  const toggleArrayFilter = (key: string, id: number) => {
    setFilters((prev: any) => ({
      ...prev,
      [key]: prev[key].includes(id) ? prev[key].filter((x: number) => x !== id) : [...prev[key], id]
    }));
  };

  const renderFilterButtons = (title: string, key: string, options: string[]) => (
    <div>
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((val) => (
          <button
            key={val}
            onClick={() => setFilters((prev: any) => ({ ...prev, [key]: val }))}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              filters[key] === val ? "bg-primary text-white" : "bg-surface text-text-primary hover:bg-border"
            )}
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
      <div className="p-4 bg-surface rounded-xl border border-border space-y-4 max-h-64 overflow-y-auto mb-4">
        {renderFilterButtons(t("app.difficulty"), "difficulty", ["All", "Easy", "Medium", "Hard"])}
        {renderFilterButtons("Intensity", "intensity",["All", "Very Low", "Low", "Moderate", "High", "Very High"])}
        {renderFilterButtons("Noise Level", "noise",["All", "Silent", "Low", "Noticeable"])}
        {renderFilterButtons("Sweat Factor", "sweat", ["All", "None", "Low", "Moderate", "High"])}
        {renderFilterButtons("Tools", "tools", ["All", "None", "Chair", "Desk", "Wall"])}
        
        {muscles && muscles.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Muscles</h3>
            <div className="flex flex-wrap gap-2">
              {muscles.map((m: any) => (
                <button key={m.muscle_id} onClick={() => toggleArrayFilter("muscles", m.muscle_id)} className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-colors", filters.muscles.includes(m.muscle_id) ? "bg-primary text-white" : "bg-surface text-text-primary hover:bg-border")}>
                  {t(`muscles.${m.name_key}`)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ExerciseCard = ({ exercise, inQueue, onAdd, onRemove, t, fontSize }: any) => {
  const imageUrl = useMediaUrl(exercise.image_url);
  const videoUrl = useMediaUrl(exercise.video_link);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className={cn("flex-shrink-0 w-[250px] h-[400px] snap-center p-3 rounded-2xl border transition-all duration-200 flex flex-col gap-3", inQueue ? "bg-primary/10 border-primary/30" : "bg-surface border-border shadow-sm hover:shadow-md")}
    >
      <div className="w-full h-1/3 bg-border rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0">
        {videoUrl ? (
          <video src={videoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <img src={imageUrl} alt={t(`exercises.${exercise.name_key}`)} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div>
          <h3 className={cn("font-bold mb-1 line-clamp-2 leading-tight", fontSize === "sm" ? "text-sm" : fontSize === "lg" ? "text-lg" : "text-base")}>{t(`exercises.${exercise.name_key}`)}</h3>
          <p className={cn("text-text-secondary mb-2 line-clamp-3 leading-snug", fontSize === "sm" ? "text-xs" : fontSize === "lg" ? "text-base" : "text-sm")}>{t(`exercises.${exercise.description_key}`)}</p>
        </div>
        <div className="flex flex-col gap-1.5 mt-auto">
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] px-1.5 py-0.5 bg-surface rounded font-medium">{exercise.duration_sec}s</span>
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", exercise.difficulty === "Easy" ? "bg-success/20 text-success" : exercise.difficulty === "Medium" ? "bg-warning/20 text-warning" : "bg-error/20 text-error")}>{exercise.difficulty}</span>
          </div>
          {exercise.tools !== "None" && <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded font-medium w-fit">{exercise.tools}</span>}
        </div>
        <button onClick={() => inQueue ? onRemove(exercise.exercise_id) : onAdd(exercise)} className={cn("mt-3 w-full h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 flex-shrink-0", inQueue ? "bg-primary text-white shadow-md" : "bg-surface text-text-secondary hover:bg-border")}>
          {inQueue ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>
    </motion.div>
  );
};

export default function SelectionScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  const[filters, setFilters] = useState({
    difficulty: "All", intensity: "All", noise: "All", sweat: "All", tools: "All", muscles: [] as number[]
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const[canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { queue, addToQueue, removeExerciseFromQueue } = useWorkoutStore();
  const { cardFontSize } = useUIStore();

  const muscles = useLiveQuery(() => db.muscles.toArray(),[]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -266 : 266;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const exercises = useLiveQuery(async () => {
    let validIds: Set<number> | null = null;

    if (filters.muscles.length > 0) {
      const em = await db.exercise_muscles.where("muscle_id").anyOf(filters.muscles).toArray();
      validIds = new Set(em.map(e => e.exercise_id));
    }

    const lowerTerm = searchTerm.toLowerCase();

    return await db.exercises.filter((ex) => {
      if (validIds && !validIds.has(ex.exercise_id)) return false;
      if (filters.difficulty !== "All" && ex.difficulty !== filters.difficulty) return false;
      if (filters.intensity !== "All" && ex.intensity !== filters.intensity) return false;
      if (filters.noise !== "All" && ex.noise_level !== filters.noise) return false;
      if (filters.sweat !== "All" && ex.sweat_factor !== filters.sweat) return false;
      if (filters.tools !== "All" && ex.tools !== filters.tools) return false;
      
      if (searchTerm) {
        return t(`exercises.${ex.name_key}`).toLowerCase().includes(lowerTerm) || t(`exercises.${ex.description_key}`).toLowerCase().includes(lowerTerm);
      }
      return true;
    }).toArray();
  },[searchTerm, filters.difficulty, filters.intensity, filters.noise, filters.sweat, filters.tools, filters.muscles]);

  useEffect(() => {
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener("resize", checkScroll);
    return () => { clearTimeout(timer); window.removeEventListener("resize", checkScroll); };
  }, [exercises]);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex gap-2">
        <button onClick={() => navigate("/")} className="p-2 bg-surface rounded-xl border border-border text-text-secondary flex items-center justify-center hover:bg-background transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input type="text" placeholder={t("app.search")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary outline-none transition-shadow" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={cn("p-2 rounded-xl border transition-colors flex items-center justify-center", showFilters ? "bg-primary/20 border-primary/30 text-primary" : "bg-surface border-border text-text-secondary")}>
          <Filter size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showFilters && <FilterPanel filters={filters} setFilters={setFilters} muscles={muscles} t={t} />}
      </AnimatePresence>

      <div className="relative flex-1 min-h-0 flex flex-col">
        {canScrollLeft && <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-surface/90 p-2 rounded-full shadow-lg border border-border text-text-primary hover:bg-background transition-colors"><ChevronLeft size={24} /></button>}
        {canScrollRight && exercises && exercises.length > 0 && <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-surface/90 p-2 rounded-full shadow-lg border border-border text-text-primary hover:bg-background transition-colors"><ChevronRight size={24} /></button>}
        
        <div ref={scrollRef} onScroll={checkScroll} className="flex-1 overflow-x-auto py-4 flex gap-4 snap-x snap-mandatory scrollbar-hide px-4 -mx-4 after:content-[''] after:w-px after:flex-shrink-0">
          {exercises === undefined ? (
            <div className="flex justify-center w-full p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : exercises.length === 0 ? (
            <div className="text-center w-full p-8 text-text-secondary">{t("app.no_exercises_found")}</div>
          ) : (
            exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.exercise_id}
                exercise={exercise}
                inQueue={queue.some((q) => q.exercise.exercise_id === exercise.exercise_id)}
                onAdd={addToQueue}
                onRemove={removeExerciseFromQueue}
                t={t}
                fontSize={cardFontSize}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}