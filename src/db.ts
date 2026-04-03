import Dexie, { Table } from "dexie";
import { INITIAL_DATA } from "./initialData";

// Define Interfaces for TypeScript safety
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
  video_link: string;
  image_url: string;
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
  list_exercises!: Table<ListExercise>;
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
    this.version(1).stores({
      exercises:
        "++exercise_id, difficulty, intensity, energy_type, tools, objective_id",
      muscles: "++muscle_id, &name_key",
      objectives: "++objective_id, &name_key",
      tags: "++tag_id, &name_key",
      exercise_muscles: "[exercise_id+muscle_id], exercise_id, muscle_id",
      exercise_tags: "[exercise_id+tag_id], exercise_id, tag_id",
      workout_lists: "++list_id, is_draft, created_at",
      list_exercises: "[list_id+exercise_id], list_id, exercise_id, position",
      workout_logs: "++log_id, start_time",
    });
    this.version(2).stores({
      workout_list_exercises: "++id, list_id, exercise_id, position",
    });
    this.version(3).stores({
      users: "++id, &username, passkey",
    });
  }
}

export const db = new MyDatabase();

export async function initializeDatabase() {
  const count = await db.exercises.count();
  if (count === 0) {
    await db.transaction(
      "rw",
      [
        db.exercises,
        db.muscles,
        db.objectives,
        db.tags,
        db.exercise_muscles,
        db.exercise_tags,
      ],
      async () => {
        await db.exercises.bulkAdd(INITIAL_DATA.exercises);
        await db.muscles.bulkAdd(INITIAL_DATA.muscles);
        await db.objectives.bulkAdd(INITIAL_DATA.objectives);
        await db.tags.bulkAdd(INITIAL_DATA.tags);
        await db.exercise_muscles.bulkAdd(INITIAL_DATA.exercise_muscles);
        await db.exercise_tags.bulkAdd(INITIAL_DATA.exercise_tags);
      },
    );
  }
}
