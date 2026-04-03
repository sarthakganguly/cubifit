import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Exercise } from "../db";
import { useAppStore } from "../store";
import {
  Plus,
  Wand2,
  BookOpen,
  Clock,
  Activity,
  X,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function HomeScreen({
  onGoToLibrary,
  onGoToWizard,
  onGoToQueue,
}: {
  onGoToLibrary: () => void;
  onGoToWizard: () => void;
  onGoToQueue: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [listToDelete, setListToDelete] = useState<number | null>(null);

  const savedLists = useLiveQuery(async () => {
    const lists = await db.workout_lists.toArray();
    const activeLists = lists
      .filter((l) => !l.is_draft)
      .sort((a, b) => b.created_at - a.created_at);

    const logs = await db.workout_logs.toArray();

    return activeLists.map((list) => {
      const completions = logs.filter(
        (log) => log.list_name === list.list_name,
      ).length;
      return { ...list, completions };
    });
  }, []);

  const handleDelete = async (e: React.MouseEvent, listId: number) => {
    e.stopPropagation();
    setListToDelete(listId);
  };

  const confirmDelete = async () => {
    if (listToDelete !== null) {
      await db.workout_lists.delete(listToDelete);
      await db.workout_list_exercises
        .where("list_id")
        .equals(listToDelete)
        .delete();
      setListToDelete(null);
    }
  };

  const loadList = async (listId: number, listName: string) => {
    const listExs = await db.workout_list_exercises
      .where("list_id")
      .equals(listId)
      .sortBy("position");
    const exIds = listExs.map((le) => le.exercise_id);
    const exs = await db.exercises.where("exercise_id").anyOf(exIds).toArray();

    const orderedExs = listExs
      .map((le) => exs.find((e) => e.exercise_id === le.exercise_id))
      .filter(Boolean) as Exercise[];

    useAppStore.getState().clearQueue();
    useAppStore.getState().setDraftName(listName);
    orderedExs.forEach((ex) => useAppStore.getState().addToQueue(ex));
    onGoToQueue();
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return "0m";
    const m = Math.floor(seconds / 60);
    return `${m} min`;
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <h2 className="text-2xl font-bold px-2">My Workouts</h2>

      <div className="grid grid-cols-2 gap-4 p-2 pb-6">
        {savedLists?.map((list) => (
          <div key={list.list_id} className="relative group">
            <button
              onClick={() => loadList(list.list_id!, list.list_name)}
              className="w-full bg-surface p-4 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all text-left flex flex-col h-32"
            >
              <h3 className="font-bold text-text-primary line-clamp-2 mb-auto pr-6">
                {list.list_name}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary mt-2">
                <div className="flex items-center gap-1" title="Exercises">
                  <Activity size={14} />
                  <span>{list.exercise_count || 0}</span>
                </div>
                <div className="flex items-center gap-1" title="Duration">
                  <Clock size={14} />
                  <span>{formatTime(list.total_duration)}</span>
                </div>
                {list.completions > 0 && (
                  <div
                    className="flex items-center gap-1 text-success font-medium"
                    title="Times Completed"
                  >
                    <CheckCircle2 size={14} />
                    <span>{list.completions}x</span>
                  </div>
                )}
              </div>
            </button>
            <button
              onClick={(e) => handleDelete(e, list.list_id!)}
              className="absolute top-3 right-3 p-1.5 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <button
          onClick={() => setShowModal(true)}
          className="bg-primary/5 p-4 rounded-2xl border-2 border-dashed border-primary/30 hover:bg-primary/10 transition-all flex flex-col items-center justify-center h-32 text-primary"
        >
          <Plus size={32} className="mb-2" />
          <span className="font-semibold text-sm text-center">
            Create exercise list
          </span>
        </button>
      </div>

      <AnimatePresence>
        {listToDelete !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-border text-center"
            >
              <div className="w-16 h-16 bg-error/20 text-error rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Workout?</h3>
              <p className="text-text-secondary mb-6">
                Are you sure you want to delete this workout? This action cannot
                be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setListToDelete(null)}
                  className="flex-1 py-3 px-4 bg-surface text-text-primary rounded-xl font-bold hover:bg-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-4 bg-error text-white rounded-xl font-bold hover:bg-error/90 transition-colors shadow-lg "
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-border"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Create Workout</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-text-secondary hover:text-text-secondary bg-surface rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    onGoToWizard();
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-colors shadow-lg "
                >
                  <div className="bg-surface/20 p-3 rounded-xl">
                    <Wand2 size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg">Wizard Mode</div>
                    <div className="text-white/80 text-sm">
                      Recommended • Auto-generate
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowModal(false);
                    onGoToLibrary();
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-background text-text-primary rounded-2xl hover:bg-surface transition-colors border border-border"
                >
                  <div className="bg-surface p-3 rounded-xl shadow-sm">
                    <BookOpen size={24} className="text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg">Exercise Library</div>
                    <div className="text-text-secondary text-sm">
                      Build manually from scratch
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
