import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Exercise } from "./db";

export interface QueueItem {
  id: string;
  exercise: Exercise;
}

// --- UI STORE ---
interface UIState {
  theme: "light" | "dark";
  toggleTheme: () => void;
  customColors: { light: Record<string, string>; dark: Record<string, string> };
  setCustomColor: (theme: "light" | "dark", key: string, value: string) => void;
  resetCustomColors: (theme: "light" | "dark") => void;
  cardFontSize: "sm" | "base" | "lg";
  setCardFontSize: (size: "sm" | "base" | "lg") => void;
  advancedMode: boolean;
  setAdvancedMode: (mode: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "light",
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      customColors: { light: {}, dark: {} },
      setCustomColor: (theme, key, value) =>
        set((state) => ({
          customColors: { ...state.customColors, [theme]: { ...state.customColors[theme], [key]: value } },
        })),
      resetCustomColors: (theme) => set((state) => ({ customColors: { ...state.customColors, [theme]: {} } })),
      cardFontSize: "base",
      setCardFontSize: (size) => set({ cardFontSize: size }),
      advancedMode: false,
      setAdvancedMode: (mode) => set({ advancedMode: mode }),
    }),
    { name: "cubifit-ui-storage" }
  )
);

// --- WORKOUT STORE ---
interface WorkoutState {
  queue: QueueItem[];
  addToQueue: (exercise: Exercise) => void;
  removeFromQueue: (id: string) => void;
  removeExerciseFromQueue: (exerciseId: number) => void;
  reorderQueue: (newQueue: QueueItem[]) => void;
  clearQueue: () => void;
  draftName: string;
  setDraftName: (name: string) => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      queue: [],
      addToQueue: (exercise) =>
        set((state) => {
          // Fallback ID generator for non-secure contexts (Docker IP access)
          const generateId = () => {
            if (typeof crypto !== "undefined" && crypto.randomUUID) {
              return crypto.randomUUID();
            }
            // Reliable fallback: timestamp + random alphanumeric string
            return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
          };

          return {
            queue: [
              ...state.queue,
              { id: generateId(), exercise },
            ],
          };
        }),
      removeFromQueue: (id) => set((state) => ({ queue: state.queue.filter((q) => q.id !== id) })),
      removeExerciseFromQueue: (exerciseId) =>
        set((state) => ({
          queue: state.queue.filter((q) => q.exercise.exercise_id !== exerciseId),
        })),
      reorderQueue: (newQueue) => set({ queue: newQueue }),
      clearQueue: () => set({ queue: [], draftName: "" }),
      draftName: "",
      setDraftName: (name) => set({ draftName: name }),
    }),
    { 
      name: "cubifit-workout-storage",
      partialize: (state) => ({ draftName: state.draftName }), 
    }
  )
);

// --- AUTH STORE ---
interface User { username: string; isPremium: boolean; trialStartDate: number }
interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  setPremium: (isPremium: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      setPremium: (isPremium) =>
        set((state) => ({ user: state.user ? { ...state.user, isPremium } : null })),
      logout: () => {
        set({ user: null });
        useWorkoutStore.getState().clearQueue();
      },
    }),
    { name: "cubifit-auth-storage" }
  )
);