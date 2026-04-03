import Dexie, { Table } from "dexie";
import { INITIAL_DATA } from "./initialData";

export interface Exercise {
  exercise_id: number;
  name_key: string;
  description_key: string;
  duration_sec: number;
  objective_id: number;
  difficulty: string;
  intensity: string;
  noise_level: string;
  sweat_factor: string;
  is_clothing_safe: boolean;
  posture_benefit: string;
  injury_risk: string;
  discreetness: string;
  time_to_start: string;
  energy_type: string;
  tools: string;
  video_link: string | Blob;
  image_url: string | Blob;
}

export interface WorkoutList {
  list_id?: number;
  list_name: string;
  created_at: number;
  is_draft: boolean;
  total_duration?: number;
  exercise_count?: number;
}

export interface ListExercise {
  id?: number;
  list_id: number;
  exercise_id: number;
  position: number;
}

export class MyDatabase extends Dexie {
  exercises!: Table<Exercise>;
  muscles!: Table<{ muscle_id: number; name_key: string }>;
  objectives!: Table<{ objective_id: number; name_key: string }>;
  tags!: Table<{ tag_id: number; name_key: string }>;
  exercise_muscles!: Table<{ exercise_id: number; muscle_id: number }>;
  exercise_tags!: Table<{ exercise_id: number; tag_id: number }>;
  workout_lists!: Table<WorkoutList>;
  workout_list_exercises!: Table<ListExercise>;
  users!: Table<{
    id?: number;
    username: string;
    password: string;
    passkey: string;
    created_at: number;
    is_premium: boolean;
    license_key?: string;
  }>;
  workout_logs!: Table<{
    log_id?: number;
    list_name: string;
    total_duration: number;
    start_time: number;
    end_time: number;
    pause_duration: number;
  }>;

  constructor() {
    super("ExerciseLibDB");
    
    // Version 1-3: Legacy Setup
    this.version(3).stores({
      exercises: "++exercise_id, difficulty, intensity, energy_type, tools, objective_id",
      muscles: "++muscle_id, &name_key",
      objectives: "++objective_id, &name_key",
      tags: "++tag_id, &name_key",
      exercise_muscles: "[exercise_id+muscle_id], exercise_id, muscle_id",
      exercise_tags: "[exercise_id+tag_id], exercise_id, tag_id",
      workout_lists: "++list_id, is_draft, created_at",
      workout_list_exercises: "++id, list_id, exercise_id, position",
      workout_logs: "++log_id, start_time",
      users: "++id, &username, passkey",
    });

    // Version 4: Add Metadata table to track "Data Version" independently of Schema Version
    this.version(4).stores({
      metadata: "key" 
    });
  }
}

export const db = new (MyDatabase as any)();

/**
 * PRODUCTION-GRADE INITIALIZATION
 * 1. Checks if the app data (exercises) is out of sync with the code.
 * 2. Uses "Put" instead of "Add" to update existing exercises (fixing typos).
 * 3. Protects user-customized media (don't overwrite Blobs with default strings).
 */
export async function initializeDatabase() {
  const DATA_VERSION = 1; // Increment this when you change INITIAL_DATA.ts contents
  
  const meta = await db.metadata.get("data_pack_version");

  if (!meta || meta.value < DATA_VERSION) {
    console.log("Database Sync: Updating exercise library to version", DATA_VERSION);
    
    await db.transaction("rw", [
      db.exercises, db.muscles, db.objectives, db.tags, 
      db.exercise_muscles, db.exercise_tags, db.metadata
    ], async () => {
      
      // 1. Sync Static Tables (Muscles, Objectives, Tags)
      await db.muscles.bulkPut(INITIAL_DATA.muscles);
      await db.objectives.bulkPut(INITIAL_DATA.objectives);
      await db.tags.bulkPut(INITIAL_DATA.tags);
      await db.exercise_muscles.bulkPut(INITIAL_DATA.exercise_muscles);
      await db.exercise_tags.bulkPut(INITIAL_DATA.exercise_tags);

      // 2. Smart Sync Exercises
      // We don't use bulkPut for exercises because we want to preserve user-uploaded media
      for (const exercise of INITIAL_DATA.exercises) {
        const existing = await db.exercises.get(exercise.exercise_id);
        
        if (existing) {
          // If the existing item has a Blob, it means the user customized it.
          // We update text fields but keep the custom media.
          const updateData = { ...exercise };
          if (existing.image_url instanceof Blob) delete (updateData as any).image_url;
          if (existing.video_link instanceof Blob) delete (updateData as any).video_link;
          
          await db.exercises.update(exercise.exercise_id, updateData);
        } else {
          // New exercise added to the code, not in user's DB yet
          await db.exercises.add(exercise);
        }
      }

      // 3. Mark sync as complete
      await db.metadata.put({ key: "data_pack_version", value: DATA_VERSION });
    });
    
    console.log("Database Sync: Complete");
  }
}