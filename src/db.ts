import Dexie, { Table } from "dexie";
import { INITIAL_DATA } from "./initialData";
import { sqliteService } from "./lib/sqlite";
import { Capacitor } from "@capacitor/core";

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
 * PHASE 2: SQLite SYNC LOGIC
 * This ensures data is saved to native SQLite to prevent iOS/Android storage eviction.
 */
export async function mirrorToSQLite(tableName: string, data: any | any[]) {
  if (Capacitor.getPlatform() === "web") return;

  try {
    const sqlite = sqliteService.getDatabase();
    const items = Array.isArray(data) ? data : [data];

    for (const item of items) {
      const keys = Object.keys(item);
      const placeholders = keys.map(() => "?").join(", ");
      const columns = keys.join(", ");

      // Clean up values: convert booleans to 1/0 and handle Blobs
      const values = keys.map(k => {
        const val = item[k];
        if (typeof val === "boolean") return val ? 1 : 0;
        if (val instanceof Blob) return "[BLOB]";
        return val ?? null;
      });

      await sqlite.run(
        `INSERT OR REPLACE INTO ${tableName} (${columns}) VALUES (${placeholders})`,
        values
      );
    }
    await sqliteService.saveWebStore();
  } catch (e) {
    console.error(`SQLite mirror failed for table ${tableName}`, e);
  }
}

async function syncToSQLite() {
  // Sync all primary tables using the centralized mirroring utility
  const exercises = await db.exercises.toArray();
  await mirrorToSQLite("exercises", exercises);

  const users = await db.users.toArray();
  await mirrorToSQLite("users", users);

  const lists = await db.workout_lists.toArray();
  await mirrorToSQLite("workout_lists", lists);

  const logs = await db.workout_logs.toArray();
  await mirrorToSQLite("workout_logs", logs);

  const muscles = await db.muscles.toArray();
  await mirrorToSQLite("muscles", muscles);

  const objectives = await db.objectives.toArray();
  await mirrorToSQLite("objectives", objectives);

  const tags = await db.tags.toArray();
  await mirrorToSQLite("tags", tags);

  const exMuscles = await db.exercise_muscles.toArray();
  await mirrorToSQLite("exercise_muscles", exMuscles);

  const exTags = await db.exercise_tags.toArray();
  await mirrorToSQLite("exercise_tags", exTags);

  const meta = await db.metadata.toArray();
  await mirrorToSQLite("metadata", meta);
}

/**
 * PHASE 2: SQLite RESTORE LOGIC
 */
async function restoreFromSQLite() {
  const sqlite = sqliteService.getDatabase();
  
  // 1. Restore Exercises
  const resEx = await sqlite.query("SELECT * FROM exercises");
  if (resEx.values) {
    await db.exercises.bulkPut(resEx.values.map(ex => ({
      ...ex,
      is_clothing_safe: !!ex.is_clothing_safe
    })));
  }

  // 2. Restore Users
  const resUsers = await sqlite.query("SELECT * FROM users");
  if (resUsers.values) {
    await db.users.bulkPut(resUsers.values.map(u => ({
      ...u,
      is_premium: !!u.is_premium
    })));
  }

  // 3. Restore Lists
  const resLists = await sqlite.query("SELECT * FROM workout_lists");
  if (resLists.values) {
    await db.workout_lists.bulkPut(resLists.values.map(l => ({
      ...l,
      is_draft: !!l.is_draft
    })));
  }

  // 4. Restore Logs
  const resLogs = await sqlite.query("SELECT * FROM workout_logs");
  if (resLogs.values) {
    await db.workout_logs.bulkPut(resLogs.values);
  }

  // 5. Restore static mappings
  const resMuscles = await sqlite.query("SELECT * FROM muscles");
  if (resMuscles.values) await db.muscles.bulkPut(resMuscles.values);
  
  const resObjectives = await sqlite.query("SELECT * FROM objectives");
  if (resObjectives.values) await db.objectives.bulkPut(resObjectives.values);

  const resTags = await sqlite.query("SELECT * FROM tags");
  if (resTags.values) await db.tags.bulkPut(resTags.values);

  const resEM = await sqlite.query("SELECT * FROM exercise_muscles");
  if (resEM.values) await db.exercise_muscles.bulkPut(resEM.values);

  const resET = await sqlite.query("SELECT * FROM exercise_tags");
  if (resET.values) await db.exercise_tags.bulkPut(resET.values);

  // 6. Restore Metadata to prevent re-sync
  const resMeta = await sqlite.query("SELECT * FROM metadata WHERE key = 'data_pack_version'");
  if (resMeta.values && resMeta.values.length > 0) {
    await db.metadata.put({ key: "data_pack_version", value: parseInt(resMeta.values[0].value) });
  }
}

/**
 * PRODUCTION-GRADE INITIALIZATION
 * 1. Checks if the app data (exercises) is out of sync with the code.
 * 2. Uses "Put" instead of "Add" to update existing exercises (fixing typos).
 * 3. Protects user-customized media (don't overwrite Blobs with default strings).
 */
export async function initializeDatabase() {
  const isWeb = Capacitor.getPlatform() === "web";

  // 1. Initialize SQLite ONLY on native platforms to avoid browser WASM bugs
  if (!isWeb) {
    try {
      await sqliteService.initialize();
    } catch (e) {
      console.warn("SQLite Native Init failed, falling back to IndexedDB only", e);
    }
  }

  const DATA_VERSION = 1;
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
      for (const exercise of INITIAL_DATA.exercises) {
        const existing = await db.exercises.get(exercise.exercise_id);
        
        if (existing) {
          const updateData = { ...exercise };
          if (existing.image_url instanceof Blob) delete (updateData as any).image_url;
          if (existing.video_link instanceof Blob) delete (updateData as any).video_link;
          
          await db.exercises.update(exercise.exercise_id, updateData);
        } else {
          await db.exercises.add(exercise);
        }
      }

      // 3. Mark sync as complete
      await db.metadata.put({ key: "data_pack_version", value: DATA_VERSION });
    });
    
    // 4. Perform Phase 2 Sync to SQLite only if it's available
    if (!isWeb) {
      await syncToSQLite().catch(e => console.error("Background SQLite sync failed", e));
    }
    
    console.log("Database Sync: Complete");
  } else {
    // Restoration only applies to native where SQLite is active
    if (!isWeb) {
      const exerciseCount = await db.exercises.count();
      if (exerciseCount === 0) {
        console.warn("IndexedDB was likely cleared. Restoring from SQLite...");
        await restoreFromSQLite().catch(e => console.error("Restoration failed", e));
      }
    }
  }
}