import { useTranslation } from "react-i18next";
import { useUIStore, useAuthStore } from "../store";
import { Moon, Sun, Download, Upload, Database, Type, Palette, RotateCcw, ShieldOff, Settings2 } from "lucide-react";
import { db } from "../db";
import { cn } from "../lib/utils";
import { DEFAULT_THEME, COLOR_LABELS } from "../theme";
import MediaManager from "./MediaManager";

export default function SettingsScreen() {
  const { t } = useTranslation();
  
  // Updated to specialized stores
  const { theme, toggleTheme, cardFontSize, setCardFontSize, customColors, setCustomColor, resetCustomColors, advancedMode, setAdvancedMode } = useUIStore();
  const { user, setPremium } = useAuthStore();

  const handleResetPremium = async () => {
    if (!user) return;
    try {
      const dbUser = await db.users.where("username").equals(user.username).first();
      if (dbUser) {
        await db.users.update(dbUser.id!, {
          is_premium: false,
          license_key: undefined,
        });
        setPremium(false);
        alert("Premium status reset!");
      }
    } catch (err) {
      console.error("Failed to reset premium", err);
    }
  };

  const handleExport = async () => {
    try {
      const logs = await db.workout_logs.toArray();
      const lists = await db.workout_lists.toArray();
      const listExercises = await db.workout_list_exercises.toArray();

      const data = {
        version: 1,
        exportDate: new Date().toISOString(),
        data: { workout_logs: logs, workout_lists: lists, workout_list_exercises: listExercises },
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cubefit-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed.");
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <h2 className="text-2xl font-bold">{t("app.settings")}</h2>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-accent" />}
              <span className="font-medium">Theme</span>
            </div>
            <button onClick={toggleTheme} className="w-14 h-8 bg-border rounded-full relative transition-colors">
              <div className={cn("absolute top-1 left-1 w-6 h-6 bg-surface rounded-full shadow-sm transition-transform", theme === "dark" ? "translate-x-6" : "translate-x-0")}></div>
            </button>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-3">
              <Type size={20} className="text-primary" />
              <span className="font-medium">Card Text Size</span>
            </div>
            <div className="flex bg-surface rounded-lg p-1 border border-border">
              {(["sm", "base", "lg"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setCardFontSize(size)}
                  className={cn("px-3 py-1.5 rounded-md text-sm font-medium transition-colors", cardFontSize === size ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary")}
                >
                  {size === "sm" ? "S" : size === "base" ? "M" : "L"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2"><Palette size={16} /> Colors</h3>
            <button onClick={() => resetCustomColors(theme)} className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-md">Reset</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(COLOR_LABELS).slice(0, 4).map(([key, label]) => {
              const value = customColors[theme]?.[key] || DEFAULT_THEME[theme][key as keyof typeof DEFAULT_THEME['light']];
              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-xs text-text-secondary">{label}</label>
                  <div className="flex items-center gap-2 bg-background p-1.5 rounded-lg border border-border">
                    <input type="color" value={value} onChange={(e) => setCustomColor(theme, key, e.target.value)} className="w-6 h-6 border-0 p-0 bg-transparent" />
                    <span className="text-[10px] font-mono uppercase">{value}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings2 size={20} className="text-primary" />
              <span className="font-medium">Advanced Mode</span>
            </div>
            <button onClick={() => setAdvancedMode(!advancedMode)} className="w-14 h-8 bg-border rounded-full relative transition-colors">
              <div className={cn("absolute top-1 left-1 w-6 h-6 bg-surface rounded-full shadow-sm transition-transform", advancedMode ? "translate-x-6 bg-primary" : "translate-x-0")}></div>
            </button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Data</h3>
          <div className="space-y-3">
            <button onClick={handleExport} className="w-full flex items-center gap-3 p-3 bg-background rounded-xl hover:bg-surface transition-colors border border-border">
              <Download size={20} className="text-text-secondary" /><span className="font-medium">Export Data</span>
            </button>
            <button onClick={handleResetPremium} className="w-full flex items-center gap-3 p-3 bg-error/5 rounded-xl hover:bg-error/10 transition-colors border border-error/10 text-error">
              <ShieldOff size={20} /><span className="font-medium">Debug: Reset Premium</span>
            </button>
          </div>
          <p className="text-[10px] text-text-secondary mt-4 flex items-center gap-1">
            <Database size={12} /> Local-first: All data stays on this device.
          </p>
        </div>
      </div>
      {advancedMode && <MediaManager />}
    </div>
  );
}