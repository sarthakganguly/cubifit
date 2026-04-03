import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWorkoutStore } from "../store";
import { Play, Pause, X, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useMediaUrl } from "../lib/utils";
import { db } from "../db";

// --- Isolated Timer Component ---
// Manages its own interval so the parent screen doesn't re-render 10x a second
const TimerRing = ({ isActive, initialDuration, onComplete, t }: { isActive: boolean, initialDuration: number, onComplete: () => void, t: any }) => {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const expectedEndTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      expectedEndTimeRef.current = Date.now() + timeLeft * 1000;
      
      const interval = setInterval(() => {
        if (!expectedEndTimeRef.current) return;
        const remaining = Math.ceil((expectedEndTimeRef.current - Date.now()) / 1000);
        
        if (remaining <= 0) {
          setTimeLeft(0);
          onComplete(); // Fire completion callback
        } else {
          setTimeLeft(remaining);
        }
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      expectedEndTimeRef.current = null;
    }
  }, [isActive, timeLeft, onComplete]);

  const progress = ((initialDuration - timeLeft) / initialDuration) * 100;

  return (
    <div className="relative w-48 h-48 mx-auto mb-8">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-border" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="45" fill="none" stroke="currentColor"
          className="text-primary transition-all duration-[100ms] ease-linear"
          strokeWidth="8"
          strokeDasharray={`${2 * Math.PI * 45}`}
          strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tabular-nums tracking-tighter">{timeLeft}</span>
        <span className="text-sm text-text-secondary uppercase tracking-widest mt-1">{t("app.sec")}</span>
      </div>
    </div>
  );
};

export default function WorkoutScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { queue, clearQueue } = useWorkoutStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentExercise = queue[currentIndex]?.exercise;
  const imageUrl = useMediaUrl(currentExercise?.image_url);
  const videoUrl = useMediaUrl(currentExercise?.video_link);
  
  const [startTime] = useState(Date.now());
  const [totalPauseTime, setTotalPauseTime] = useState(0);
  const pauseStartTimeRef = useRef<number | null>(null);

  const toggleTimer = () => {
    if (isActive) {
      pauseStartTimeRef.current = Date.now();
      setIsActive(false);
    } else {
      if (pauseStartTimeRef.current) {
        setTotalPauseTime((prev) => prev + (Date.now() - pauseStartTimeRef.current!));
        pauseStartTimeRef.current = null;
      }
      setIsActive(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsActive(true); 
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = async () => {
    setIsActive(false);
    setIsFinished(true);
    try {
      await db.workout_logs.add({
        list_name: "Custom Workout",
        start_time: startTime,
        end_time: Date.now(),
        total_duration: Date.now() - startTime,
        pause_duration: totalPauseTime,
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!currentExercise && !isFinished) return null;

  if (isFinished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full text-center space-y-6 p-6">
        <div className="w-24 h-24 bg-success/20 text-success rounded-full flex items-center justify-center"><CheckCircle2 size={48} /></div>
        <div>
          <h2 className="text-3xl font-bold mb-2">{t("app.workout_complete")}</h2>
          <p className="text-text-secondary">You completed {queue.length} exercises!</p>
        </div>
        <div className="w-full bg-surface rounded-2xl p-6 shadow-sm border border-border space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Total Time</span>
            <span className="font-bold text-lg">
              {Math.floor((Date.now() - startTime) / 60000)}m {Math.floor(((Date.now() - startTime) % 60000) / 1000)}s
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Pause Time</span>
            <span className="font-bold text-lg">{Math.floor(totalPauseTime / 1000)}s</span>
          </div>
        </div>
        <button onClick={() => { clearQueue(); navigate("/history"); }} className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors">{t("app.back_to_home")}</button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate("/")} className="p-2 text-text-secondary hover:bg-surface rounded-full transition-colors"><X size={24} /></button>
        <div className="text-sm font-medium text-text-secondary">Exercise {currentIndex + 1} of {queue.length}</div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExercise.exercise_id}
            initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-sm bg-surface rounded-3xl shadow-xl border border-border overflow-hidden"
          >
            <div className="w-full aspect-video bg-border flex items-center justify-center relative overflow-hidden">
              {videoUrl ? (
                <video src={videoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <img src={imageUrl} alt={t(`exercises.${currentExercise.name_key}`)} className="absolute inset-0 w-full h-full object-cover" />
              )}
            </div>

            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-3">{t(`exercises.${currentExercise.name_key}`)}</h2>
              <p className="text-text-secondary text-sm mb-6 line-clamp-2">{t(`exercises.${currentExercise.description_key}`)}</p>

              {/* ISOLATED TIMER: Parent screen no longer re-renders 10x per second */}
              <TimerRing 
                isActive={isActive} 
                initialDuration={currentExercise.duration_sec} 
                onComplete={handleNext} 
                t={t} 
              />

              <div className="flex items-center justify-center gap-6">
                <button onClick={toggleTimer} className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-transform active:scale-95 shadow-lg">
                  {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
                </button>
                <button onClick={() => { setIsActive(false); handleNext(); }} className="w-14 h-14 bg-surface text-text-secondary rounded-full flex items-center justify-center hover:bg-border transition-transform active:scale-95">
                  <ChevronRight size={28} />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}