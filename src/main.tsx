// /src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { initializeDatabase } from "./db";

// Capacitor SQLite + Web Support
import { defineCustomElements as jeepSqlite } from "jeep-sqlite/loader";
import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";

const initApp = async () => {
  // On web, we skip the complex jeep-sqlite setup during boot to avoid WASM memory errors.
  // SQLite will only be initialized on native platforms or via lazy-sync.
  if (Capacitor.getPlatform() !== "web") {
    await initializeDatabase();
  } else {
    // Basic initialization for web (Dexie only)
    await initializeDatabase();
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
};

initApp();