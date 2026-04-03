import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, Exercise } from "../db";
import { useWorkoutStore } from "../store";
import { cn } from "../lib/utils";

type WizardStep = 1 | 2 | 3 | 4 | 5;

export default function WizardScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState<WizardStep>(1);
  const [silent, setSilent] = useState<boolean | null>(null);
  const [energy, setEnergy] = useState<string | null>(null);
  const [noSweat, setNoSweat] = useState<boolean | null>(null);
  const [tools, setTools] = useState<string[]>([]);
  const [timeMinutes, setTimeMinutes] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Updated to use the correct specialized store
  const { clearQueue, addToQueue, setDraftName } = useWorkoutStore();

  const handleNext = () => {
    if (step < 5) setStep((s) => (s + 1) as WizardStep);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as WizardStep);
    else navigate("/");
  };

  const toggleTool = (tool: string) => {
    setTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool],
    );
  };

  const generateWorkout = async (overrideTime?: number) => {
    const timeToUse = overrideTime || timeMinutes;
    if (!timeToUse) return;
    setIsGenerating(true);

    try {
      let collection = db.exercises.toCollection();
      let allExercises = await collection.toArray();

      if (silent) {
        allExercises = allExercises.filter(
          (ex) =>
            ["High", "Moderate"].includes(ex.discreetness) &&
            ["Silent", "Low"].includes(ex.noise_level),
        );
      }

      if (energy) {
        allExercises = allExercises.filter((ex) => ex.energy_type === energy);
      }

      if (noSweat) {
        allExercises = allExercises.filter((ex) =>
          ["None", "Low"].includes(ex.sweat_factor),
        );
      }

      if (tools.length > 0) {
        const mappedTools = tools.map((t) => (t === "Freehand" ? "None" : t));
        allExercises = allExercises.filter((ex) =>
          mappedTools.includes(ex.tools),
        );
      }

      if (allExercises.length === 0) {
        alert("No exercises matched. Try loosening your filters!");
        setIsGenerating(false);
        return;
      }

      const targetDurationSec = timeToUse * 60;
      let currentDuration = 0;
      const selectedExercises: Exercise[] = [];
      const shuffled = [...allExercises].sort(() => 0.5 - Math.random());

      let i = 0;
      while (currentDuration < targetDurationSec) {
        const ex = shuffled[i % shuffled.length];
        selectedExercises.push(ex);
        currentDuration += ex.duration_sec;
        i++;
      }

      clearQueue();
      selectedExercises.forEach((ex) => addToQueue(ex));
      setDraftName(`Wizard Workout (${timeToUse}m)`);

      navigate("/queue");
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-center">I want to be silent and discreet</h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setSilent(true); setTimeout(() => setStep(2), 250); }} className={cn("p-4 rounded-xl border-2 font-bold text-lg", silent === true ? "border-primary bg-primary/10 text-primary" : "border-border")}>Yes</button>
              <button onClick={() => { setSilent(false); setTimeout(() => setStep(2), 250); }} className={cn("p-4 rounded-xl border-2 font-bold text-lg", silent === false ? "border-primary bg-primary/10 text-primary" : "border-border")}>No</button>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-center">Energy type</h3>
            <div className="flex flex-col gap-3">
              {["Neutral", "Energizing", "Relaxing"].map((opt) => (
                <button key={opt} onClick={() => { setEnergy(opt); setTimeout(() => setStep(3), 250); }} className={cn("p-4 rounded-xl border-2 font-bold text-lg", energy === opt ? "border-primary bg-primary/10 text-primary" : "border-border")}>{opt}</button>
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-center">No sweat</h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setNoSweat(true); setTimeout(() => setStep(4), 250); }} className={cn("p-4 rounded-xl border-2 font-bold text-lg", noSweat === true ? "border-primary bg-primary/10 text-primary" : "border-border")}>Yes</button>
              <button onClick={() => { setNoSweat(false); setTimeout(() => setStep(4), 250); }} className={cn("p-4 rounded-xl border-2 font-bold text-lg", noSweat === false ? "border-primary bg-primary/10 text-primary" : "border-border")}>No</button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-center">Tools to use</h3>
            <div className="grid grid-cols-2 gap-3">
              {["Chair", "Desk", "Wall", "Freehand"].map((opt) => (
                <button key={opt} onClick={() => toggleTool(opt)} className={cn("p-4 rounded-xl border-2 font-bold flex items-center justify-center relative", tools.includes(opt) ? "border-primary bg-primary/10 text-primary" : "border-border")}>
                  {tools.includes(opt) && <Check size={16} className="absolute top-2 right-2" />}
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-center">Total Time</h3>
            <div className="flex flex-col gap-3">
              {[5, 10, 15].map((opt) => (
                <button key={opt} onClick={() => { setTimeMinutes(opt); generateWorkout(opt); }} className={cn("p-4 rounded-xl border-2 font-bold text-lg", timeMinutes === opt ? "border-primary bg-primary/10 text-primary" : "border-border")}>
                  {isGenerating && timeMinutes === opt ? "Generating..." : `${opt} minutes`}
                </button>
              ))}
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={handleBack} className="p-2 bg-surface rounded-full border border-border text-text-secondary"><ArrowLeft size={20} /></button>
        <div className="flex-1 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={cn("h-2 rounded-full transition-all", step >= s ? "bg-primary w-8" : "bg-border w-4")} />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>

      {step === 4 && (
        <div className="mt-auto pt-6 pb-6">
          <button onClick={handleNext} disabled={tools.length === 0} className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg">
            Next Step <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}