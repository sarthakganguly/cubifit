import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Exercise } from "../db";
import { useAppStore } from "../store";
import {
  Plus,
  Check,
  Search,
  Filter,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export default function SelectionScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [intensityFilter, setIntensityFilter] = useState<string>("All");
  const [noiseFilter, setNoiseFilter] = useState<string>("All");
  const [sweatFilter, setSweatFilter] = useState<string>("All");
  const [toolsFilter, setToolsFilter] = useState<string>("All");
  const [energyFilter, setEnergyFilter] = useState<string>("All");
  const [discreetnessFilter, setDiscreetnessFilter] = useState<string>("All");
  const [selectedMuscles, setSelectedMuscles] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -266 : 266;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const queue = useAppStore((state) => state.queue);
  const addToQueue = useAppStore((state) => state.addToQueue);
  const removeExerciseFromQueue = useAppStore(
    (state) => state.removeExerciseFromQueue,
  );
  const cardFontSize = useAppStore((state) => state.cardFontSize);

  const muscles = useLiveQuery(() => db.muscles.toArray());
  const tags = useLiveQuery(() => db.tags.toArray());

  // Query exercises
  const exercises = useLiveQuery(async () => {
    let collection = db.exercises.toCollection();

    if (difficultyFilter !== "All") {
      collection = db.exercises.where("difficulty").equals(difficultyFilter);
    }

    let results = await collection.toArray();

    if (selectedMuscles.length > 0) {
      const exerciseMuscles = await db.exercise_muscles
        .where("muscle_id")
        .anyOf(selectedMuscles)
        .toArray();
      const validExerciseIds = new Set(
        exerciseMuscles.map((em) => em.exercise_id),
      );
      results = results.filter((ex) => validExerciseIds.has(ex.exercise_id));
    }

    if (selectedTags.length > 0) {
      const exerciseTags = await db.exercise_tags
        .where("tag_id")
        .anyOf(selectedTags)
        .toArray();
      const validExerciseIds = new Set(
        exerciseTags.map((et) => et.exercise_id),
      );
      results = results.filter((ex) => validExerciseIds.has(ex.exercise_id));
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      results = results.filter(
        (ex) =>
          t(`exercises.${ex.name_key}`).toLowerCase().includes(lowerTerm) ||
          t(`exercises.${ex.description_key}`)
            .toLowerCase()
            .includes(lowerTerm),
      );
    }

    if (intensityFilter !== "All")
      results = results.filter((ex) => ex.intensity === intensityFilter);
    if (noiseFilter !== "All")
      results = results.filter((ex) => ex.noise_level === noiseFilter);
    if (sweatFilter !== "All")
      results = results.filter((ex) => ex.sweat_factor === sweatFilter);
    if (toolsFilter !== "All")
      results = results.filter((ex) => ex.tools === toolsFilter);
    if (energyFilter !== "All")
      results = results.filter((ex) => ex.energy_type === energyFilter);
    if (discreetnessFilter !== "All")
      results = results.filter((ex) => ex.discreetness === discreetnessFilter);

    return results;
  }, [
    searchTerm,
    difficultyFilter,
    intensityFilter,
    noiseFilter,
    sweatFilter,
    toolsFilter,
    energyFilter,
    discreetnessFilter,
    selectedMuscles,
    selectedTags,
    t,
  ]);

  const toggleMuscle = (id: number) => {
    setSelectedMuscles((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const toggleTag = (id: number) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="p-2 bg-surface rounded-xl border border-border text-text-secondary flex items-center justify-center hover:bg-background transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            size={18}
          />
          <input
            type="text"
            placeholder={t("app.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface focus:ring-2 focus:ring-primary outline-none transition-shadow"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "p-2 rounded-xl border transition-colors flex items-center justify-center",
            showFilters
              ? "bg-primary/20 border-primary/30 text-primary"
              : "bg-surface border-border text-text-secondary",
          )}
        >
          <Filter size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-surface rounded-xl border border-border space-y-4 max-h-64 overflow-y-auto">
              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  {t("app.difficulty")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["All", "Easy", "Medium", "Hard"].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficultyFilter(diff)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        difficultyFilter === diff
                          ? "bg-primary text-white"
                          : "bg-surface text-text-primary hover:bg-border ",
                      )}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Intensity
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "All",
                    "Very Low",
                    "Low",
                    "Moderate",
                    "High",
                    "Very High",
                  ].map((val) => (
                    <button
                      key={val}
                      onClick={() => setIntensityFilter(val)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        intensityFilter === val
                          ? "bg-primary text-white"
                          : "bg-surface text-text-primary hover:bg-border ",
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Noise Level
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["All", "Silent", "Low", "Noticeable"].map((val) => (
                    <button
                      key={val}
                      onClick={() => setNoiseFilter(val)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        noiseFilter === val
                          ? "bg-primary text-white"
                          : "bg-surface text-text-primary hover:bg-border ",
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Sweat Factor
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["All", "None", "Low", "Moderate", "High"].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSweatFilter(val)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        sweatFilter === val
                          ? "bg-primary text-white"
                          : "bg-surface text-text-primary hover:bg-border ",
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Tools
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["All", "None", "Chair", "Desk", "Wall"].map((val) => (
                    <button
                      key={val}
                      onClick={() => setToolsFilter(val)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        toolsFilter === val
                          ? "bg-primary text-white"
                          : "bg-surface text-text-primary hover:bg-border ",
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Energy Type
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["All", "Neutral", "Energizing", "Relaxing"].map((val) => (
                    <button
                      key={val}
                      onClick={() => setEnergyFilter(val)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        energyFilter === val
                          ? "bg-primary text-white"
                          : "bg-surface text-text-primary hover:bg-border ",
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Discreetness
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["All", "Low", "Moderate", "High"].map((val) => (
                    <button
                      key={val}
                      onClick={() => setDiscreetnessFilter(val)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        discreetnessFilter === val
                          ? "bg-primary text-white"
                          : "bg-surface text-text-primary hover:bg-border ",
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {muscles && muscles.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                    Muscles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {muscles.map((m) => (
                      <button
                        key={m.muscle_id}
                        onClick={() => toggleMuscle(m.muscle_id)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                          selectedMuscles.includes(m.muscle_id)
                            ? "bg-primary text-white"
                            : "bg-surface text-text-primary hover:bg-border ",
                        )}
                      >
                        {t(`muscles.${m.name_key}`)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tags && tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.tag_id}
                        onClick={() => toggleTag(tag.tag_id)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                          selectedTags.includes(tag.tag_id)
                            ? "bg-primary text-white"
                            : "bg-surface text-text-primary hover:bg-border ",
                        )}
                      >
                        {t(`tags.${tag.name_key}`)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex-1 min-h-0 flex flex-col">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-surface/90 p-2 rounded-full shadow-lg border border-border text-text-primary hover:bg-background transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        {canScrollRight && exercises && exercises.length > 0 && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-surface/90 p-2 rounded-full shadow-lg border border-border text-text-primary hover:bg-background transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        )}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex-1 overflow-x-auto py-4 flex gap-4 snap-x snap-mandatory scrollbar-hide px-4 -mx-4 after:content-[''] after:w-px after:flex-shrink-0"
        >
          {exercises === undefined ? (
            <div className="flex justify-center w-full p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : exercises.length === 0 ? (
            <div className="text-center w-full p-8 text-text-secondary">
              {t("app.no_exercises_found")}
            </div>
          ) : (
            exercises.map((exercise) => {
              const inQueue = queue.some(
                (q) => q.exercise.exercise_id === exercise.exercise_id,
              );
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={exercise.exercise_id}
                  className={cn(
                    "flex-shrink-0 w-[250px] h-[400px] snap-center p-3 rounded-2xl border transition-all duration-200 flex flex-col gap-3",
                    inQueue
                      ? "bg-primary/10 border-primary/30"
                      : "bg-surface border-border shadow-sm hover:shadow-md",
                  )}
                >
                  {/* Video Placeholder */}
                  <div className="w-full h-1/3 bg-border rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0">
                    <img
                      src={exercise.image_url}
                      alt={t(`exercises.${exercise.name_key}`)}
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                    <span className="relative z-10 text-xs text-white font-medium px-2 py-1 bg-black/50 rounded-md text-center">
                      Video
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-h-0">
                    <div>
                      <h3
                        className={cn(
                          "font-bold mb-1 line-clamp-2 leading-tight",
                          cardFontSize === "sm"
                            ? "text-sm"
                            : cardFontSize === "lg"
                              ? "text-lg"
                              : "text-base",
                        )}
                      >
                        {t(`exercises.${exercise.name_key}`)}
                      </h3>
                      <p
                        className={cn(
                          "text-text-secondary mb-2 line-clamp-3 leading-snug",
                          cardFontSize === "sm"
                            ? "text-xs"
                            : cardFontSize === "lg"
                              ? "text-base"
                              : "text-sm",
                        )}
                      >
                        {t(`exercises.${exercise.description_key}`)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-auto">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 bg-surface rounded font-medium">
                          {exercise.duration_sec}s
                        </span>
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-medium",
                            exercise.difficulty === "Easy"
                              ? "bg-success/20 text-success"
                              : exercise.difficulty === "Medium"
                                ? "bg-warning/20 text-warning"
                                : "bg-error/20 text-error",
                          )}
                        >
                          {exercise.difficulty}
                        </span>
                      </div>
                      {exercise.tools !== "None" && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded font-medium w-fit">
                          {exercise.tools}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        inQueue
                          ? removeExerciseFromQueue(exercise.exercise_id)
                          : addToQueue(exercise)
                      }
                      className={cn(
                        "mt-3 w-full h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 flex-shrink-0",
                        inQueue
                          ? "bg-primary text-white shadow-md "
                          : "bg-surface text-text-secondary hover:bg-border",
                      )}
                    >
                      {inQueue ? <Check size={16} /> : <Plus size={16} />}
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
