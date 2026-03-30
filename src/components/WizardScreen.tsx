import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronRight, Wand2, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, Exercise } from "../db";
import { useAppStore } from "../store";
import { cn } from "../lib/utils";

type WizardStep = 1 | 2 | 3 | 4 | 5;

export default function WizardScreen({
  onBack,
  onComplete,
}: {
  onBack: () => void;
  onComplete: () => void;
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState<WizardStep>(1);
  const [silent, setSilent] = useState<boolean | null>(null);
  const [energy, setEnergy] = useState<string | null>(null);
  const [noSweat, setNoSweat] = useState<boolean | null>(null);
  const [tools, setTools] = useState<string[]>([]);
  const [timeMinutes, setTimeMinutes] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const clearQueue = useAppStore((state) => state.clearQueue);
  const addToQueue = useAppStore((state) => state.addToQueue);
  const setDraftName = useAppStore((state) => state.setDraftName);

  const handleNext = () => {
    if (step < 5) setStep((s) => (s + 1) as WizardStep);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as WizardStep);
    else onBack();
  };

  const toggleTool = (tool: string) => {
    setTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool],
    );
  };

  const handleSilentSelect = (val: boolean) => {
    setSilent(val);
    setTimeout(() => setStep(2), 250);
  };

  const handleEnergySelect = (val: string) => {
    setEnergy(val);
    setTimeout(() => setStep(3), 250);
  };

  const handleNoSweatSelect = (val: boolean) => {
    setNoSweat(val);
    setTimeout(() => setStep(4), 250);
  };

  const handleTimeSelect = (val: number) => {
    setTimeMinutes(val);
    setTimeout(() => generateWorkout(val), 250);
  };

  const generateWorkout = async (overrideTime?: number) => {
    const timeToUse = overrideTime || timeMinutes;
    if (!timeToUse) return;
    setIsGenerating(true);

    try {
      let collection = db.exercises.toCollection();
      let allExercises = await collection.toArray();

      // Filter by Silent
      if (silent) {
        allExercises = allExercises.filter(
          (ex) =>
            ["High", "Moderate"].includes(ex.discreetness) &&
            ["Silent", "Low"].includes(ex.noise_level),
        );
      }

      // Filter by Energy
      if (energy) {
        allExercises = allExercises.filter((ex) => ex.energy_type === energy);
      }

      // Filter by No Sweat
      if (noSweat) {
        allExercises = allExercises.filter((ex) =>
          ["None", "Low"].includes(ex.sweat_factor),
        );
      }

      // Filter by Tools
      if (tools.length > 0) {
        const mappedTools = tools.map((t) => (t === "Freehand" ? "None" : t));
        allExercises = allExercises.filter((ex) =>
          mappedTools.includes(ex.tools),
        );
      }

      if (allExercises.length === 0) {
        alert(
          "No exercises matched your strict criteria. Try loosening your filters!",
        );
        setIsGenerating(false);
        return;
      }

      const targetDurationSec = timeToUse * 60;
      let currentDuration = 0;
      const selectedExercises: Exercise[] = [];

      // Randomize array
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

      onComplete();
    } catch (e) {
      console.error(e);
      alert("Failed to generate workout.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            <h3 className="text-2xl font-bold text-center">
              I want to be silent and discreet
            </h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSilentSelect(true)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all font-bold text-lg",
                  silent === true
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50",
                )}
              >
                Yes
              </button>
              <button
                onClick={() => handleSilentSelect(false)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all font-bold text-lg",
                  silent === false
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50",
                )}
              >
                No
              </button>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            <h3 className="text-2xl font-bold text-center">Energy type</h3>
            <div className="flex flex-col gap-3">
              {["Neutral", "Energizing", "Relaxing"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleEnergySelect(opt)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all font-bold text-lg",
                    energy === opt
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            <h3 className="text-2xl font-bold text-center">No sweat</h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleNoSweatSelect(true)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all font-bold text-lg",
                  noSweat === true
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50",
                )}
              >
                Yes
              </button>
              <button
                onClick={() => handleNoSweatSelect(false)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all font-bold text-lg",
                  noSweat === false
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50",
                )}
              >
                No
              </button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            <h3 className="text-2xl font-bold text-center">Tools to use</h3>
            <p className="text-center text-sm text-text-secondary -mt-4">
              Select all that apply
            </p>
            <div className="grid grid-cols-2 gap-3">
              {["Chair", "Desk", "Wall", "Freehand"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => toggleTool(opt)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all font-bold flex flex-col items-center justify-center gap-2",
                    tools.includes(opt)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  {tools.includes(opt) && (
                    <Check
                      size={20}
                      className="absolute top-2 right-2 text-primary"
                    />
                  )}
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            <h3 className="text-2xl font-bold text-center">Total Time</h3>
            <div className="flex flex-col gap-3">
              {[5, 10, 15].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleTimeSelect(opt)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all font-bold text-lg relative overflow-hidden",
                    timeMinutes === opt
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  {isGenerating && timeMinutes === opt ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary text-white">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                  ) : null}
                  {opt} minutes
                </button>
              ))}
            </div>
          </motion.div>
        );
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && silent === null) return true;
    if (step === 2 && energy === null) return true;
    if (step === 3 && noSweat === null) return true;
    if (step === 4 && tools.length === 0) return true;
    if (step === 5 && timeMinutes === null) return true;
    return false;
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className="p-2 bg-surface rounded-full shadow-sm border border-border text-text-secondary hover:bg-background  transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 rounded-full transition-all",
                step >= s ? "bg-primary w-8" : "bg-border w-4",
              )}
            />
          ))}
        </div>
        <div className="w-10" /> {/* Spacer for balance */}
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>

      <div className="mt-auto pt-6 pb-6">
        {step === 4 && (
          <button
            onClick={handleNext}
            disabled={isNextDisabled()}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg "
          >
            Next Step
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
