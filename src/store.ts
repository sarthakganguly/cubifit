import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Exercise } from "./db";

export interface QueueItem {
  id: string;
  exercise: Exercise;
}

interface AppState {
  theme: "light" | "dark";
  toggleTheme: () => void;
  customColors: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
  setCustomColor: (theme: "light" | "dark", key: string, value: string) => void;
  resetCustomColors: (theme: "light" | "dark") => void;
  cardFontSize: "sm" | "base" | "lg";
  setCardFontSize: (size: "sm" | "base" | "lg") => void;
  queue: QueueItem[];
  addToQueue: (exercise: Exercise) => void;
  removeFromQueue: (id: string) => void;
  removeExerciseFromQueue: (exerciseId: number) => void;
  reorderQueue: (newQueue: QueueItem[]) => void;
  clearQueue: () => void;
  draftName: string;
  setDraftName: (name: string) => void;
  user: {
    username: string;
    isPremium: boolean;
    trialStartDate: number;
  } | null;
  setUser: (
    user: {
      username: string;
      isPremium: boolean;
      trialStartDate: number;
    } | null,
  ) => void;
  setPremium: (isPremium: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "light",
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      customColors: { light: {}, dark: {} },
      setCustomColor: (theme, key, value) =>
        set((state) => ({
          customColors: {
            ...state.customColors,
            [theme]: {
              ...state.customColors[theme],
              [key]: value,
            },
          },
        })),
      resetCustomColors: (theme) =>
        set((state) => ({
          customColors: {
            ...state.customColors,
            [theme]: {},
          },
        })),
      cardFontSize: "base",
      setCardFontSize: (size) => set({ cardFontSize: size }),
      queue: [],
      addToQueue: (exercise) =>
        set((state) => ({
          queue: [
            ...state.queue,
            { id: Math.random().toString(36).substring(2, 9), exercise },
          ],
        })),
      removeFromQueue: (id) =>
        set((state) => ({ queue: state.queue.filter((q) => q.id !== id) })),
      removeExerciseFromQueue: (exerciseId) =>
        set((state) => ({
          queue: state.queue.filter(
            (q) => q.exercise.exercise_id !== exerciseId,
          ),
        })),
      reorderQueue: (newQueue) => set({ queue: newQueue }),
      clearQueue: () => set({ queue: [], draftName: "" }),
      draftName: "",
      setDraftName: (name) => set({ draftName: name }),
      user: null,
      setUser: (user) => set({ user }),
      setPremium: (isPremium) =>
        set((state) => ({
          user: state.user ? { ...state.user, isPremium } : null,
        })),
      logout: () => set({ user: null, queue: [], draftName: "" }),
    }),
    {
      name: "deskfit-storage",
    },
  ),
);
