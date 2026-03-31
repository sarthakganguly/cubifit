import Dexie, { Table } from 'dexie';

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
}

export interface WorkoutList {
  list_id?: number;
  list_name: string;
  created_at: number;
  is_draft: boolean;
}

export interface ListExercise {
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
  workout_logs!: Table<{ 
    log_id?: number; 
    list_name: string; 
    total_duration: number; 
    start_time: number; 
    end_time: number; 
    pause_duration: number 
  }>;

  constructor() {
    super('ExerciseLibDB');
    this.version(1).stores({
      exercises: '++exercise_id, difficulty, intensity, energy_type, tools, objective_id',
      muscles: '++muscle_id, &name_key',
      objectives: '++objective_id, &name_key',
      tags: '++tag_id, &name_key',
      exercise_muscles: '[exercise_id+muscle_id], exercise_id, muscle_id',
      exercise_tags: '[exercise_id+tag_id], exercise_id, tag_id',
      workout_lists: '++list_id, is_draft, created_at',
      list_exercises: '[list_id+exercise_id], list_id, exercise_id, position',
      workout_logs: '++log_id, start_time'
    });
  }
}

export const db = new MyDatabase();