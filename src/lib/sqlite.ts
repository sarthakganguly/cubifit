import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";

class SQLiteService {
  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private dbName: string = "cubifit_db";

  async initialize() {
    if (Capacitor.getPlatform() === "web") {
      const jeepEl = document.querySelector("jeep-sqlite");
      if (jeepEl) {
        try {
          await this.sqlite.initWebStore();
        } catch (e) {
          console.log("Web store already initialized", e);
        }
      }
    }

    this.db = await this.sqlite.createConnection(
      this.dbName,
      false, // encrypted
      "no-encryption",
      1, // version
      false // readonly
    );

    await this.db.open();
    await this.runMigrations();
  }

  private async runMigrations() {
    if (!this.db) return;

    // Define the schema using a single transaction/execute string
    const schema = `
      CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT
      );
      CREATE TABLE IF NOT EXISTS exercises (
        exercise_id INTEGER PRIMARY KEY,
        name_key TEXT,
        description_key TEXT,
        duration_sec INTEGER,
        objective_id INTEGER,
        difficulty TEXT,
        intensity TEXT,
        noise_level TEXT,
        sweat_factor TEXT,
        is_clothing_safe BOOLEAN,
        posture_benefit TEXT,
        injury_risk TEXT,
        discreetness TEXT,
        time_to_start TEXT,
        energy_type TEXT,
        tools TEXT,
        video_link TEXT,
        image_url TEXT
      );
      CREATE TABLE IF NOT EXISTS muscles (
        muscle_id INTEGER PRIMARY KEY,
        name_key TEXT UNIQUE
      );
      CREATE TABLE IF NOT EXISTS objectives (
        objective_id INTEGER PRIMARY KEY,
        name_key TEXT UNIQUE
      );
      CREATE TABLE IF NOT EXISTS tags (
        tag_id INTEGER PRIMARY KEY,
        name_key TEXT UNIQUE
      );
      CREATE TABLE IF NOT EXISTS exercise_muscles (
        exercise_id INTEGER,
        muscle_id INTEGER,
        PRIMARY KEY (exercise_id, muscle_id)
      );
      CREATE TABLE IF NOT EXISTS exercise_tags (
        exercise_id INTEGER,
        tag_id INTEGER,
        PRIMARY KEY (exercise_id, tag_id)
      );
      CREATE TABLE IF NOT EXISTS workout_lists (
        list_id INTEGER PRIMARY KEY AUTOINCREMENT,
        list_name TEXT,
        created_at INTEGER,
        is_draft BOOLEAN,
        total_duration INTEGER,
        exercise_count INTEGER
      );
      CREATE TABLE IF NOT EXISTS workout_list_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        list_id INTEGER,
        exercise_id INTEGER,
        position INTEGER
      );
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        passkey TEXT,
        created_at INTEGER,
        is_premium BOOLEAN,
        license_key TEXT
      );
      CREATE TABLE IF NOT EXISTS workout_logs (
        log_id INTEGER PRIMARY KEY AUTOINCREMENT,
        list_name TEXT,
        total_duration INTEGER,
        start_time INTEGER,
        end_time INTEGER,
        pause_duration INTEGER
      );
    `;

    await this.db.execute(schema);
  }

  getDatabase() {
    if (!this.db) throw new Error("Database not initialized");
    return this.db;
  }

  async saveWebStore() {
    if (Capacitor.getPlatform() === "web" && this.db) {
      await this.sqlite.saveToStore(this.dbName);
    }
  }
}

export const sqliteService = new SQLiteService();
