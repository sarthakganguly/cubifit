import { useTranslation } from "react-i18next";
import { useAppStore } from "../store";
import { Moon, Sun, Download, Upload, Database, Type, Palette, RotateCcw, Trash2, ShieldOff, Settings2 } from "lucide-react";
import { db } from "../db";
import { cn } from "../lib/utils";
import { DEFAULT_THEME, COLOR_LABELS, SHADOW_LABELS } from "../theme";
import MediaManager from "./MediaManager";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const cardFontSize = useAppStore((state) => state.cardFontSize);
  const setCardFontSize = useAppStore((state) => state.setCardFontSize);
  const customColors = useAppStore((state) => state.customColors);
  const setCustomColor = useAppStore((state) => state.setCustomColor);
  const resetCustomColors = useAppStore((state) => state.resetCustomColors);
  const user = useAppStore((state) => state.user);
  const setPremium = useAppStore((state) => state.setPremium);
  const advancedMode = useAppStore((state) => state.advancedMode);
  const setAdvancedMode = useAppStore((state) => state.setAdvancedMode);

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
        alert("Premium status reset! You can now retest the activation flow.");
      }
    } catch (err) {
      console.error("Failed to reset premium", err);
      alert("Failed to reset premium status.");
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
        data: {
          workout_logs: logs,
          workout_lists: lists,
          workout_list_exercises: listExercises,
        },
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cubefit-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
      alert("Failed to export data.");
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);

          if (parsed.data && parsed.data.workout_logs) {
            await db.transaction(
              "rw",
              db.workout_logs,
              db.workout_lists,
              db.workout_list_exercises,
              async () => {
                if (parsed.data.workout_logs.length)
                  await db.workout_logs.bulkAdd(parsed.data.workout_logs);
                if (parsed.data.workout_lists?.length)
                  await db.workout_lists.bulkAdd(parsed.data.workout_lists);
                if (parsed.data.workout_list_exercises?.length)
                  await db.workout_list_exercises.bulkAdd(
                    parsed.data.workout_list_exercises,
                  );
              },
            );
            alert("Data imported successfully!");
          } else {
            alert("Invalid backup file format.");
          }
        } catch (err) {
          console.error("Import failed", err);
          alert("Failed to parse or import data.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <h2 className="text-2xl font-bold">{t("app.settings")}</h2>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Appearance
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon size={20} className="text-primary" />
              ) : (
                <Sun size={20} className="text-accent" />
              )}
              <span className="font-medium">Theme</span>
            </div>
            <button
              onClick={toggleTheme}
              className="w-14 h-8 bg-border rounded-full relative transition-colors focus:outline-none"
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-surface rounded-full shadow-sm transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-0"}`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-3">
              <Type size={20} className="text-primary" />
              <span className="font-medium">Card Text Size</span>
            </div>
            <div className="flex bg-surface rounded-lg p-1">
              {(["sm", "base", "lg"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setCardFontSize(size)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    cardFontSize === size
                      ? "bg-surface shadow-sm text-primary"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {size === "sm"
                    ? "Small"
                    : size === "base"
                      ? "Medium"
                      : "Large"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
              <Palette size={16} />
              Custom Theme Colors
            </h3>
            <button
              onClick={() => resetCustomColors(theme)}
              className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 transition-colors bg-primary/10 px-2 py-1 rounded-md"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.entries(COLOR_LABELS).map(([key, label]) => {
              const value = customColors[theme]?.[key] || DEFAULT_THEME[theme][key as keyof typeof DEFAULT_THEME['light']];
              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-xs text-text-secondary font-medium">{label}</label>
                  <div className="flex items-center gap-2 bg-background p-1.5 rounded-lg border border-border">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => setCustomColor(theme, key, e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                    />
                    <span className="text-xs font-mono text-text-primary uppercase truncate">
                      {value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">Shadow Configuration</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-secondary font-medium">Shadow Color</label>
                <div className="flex items-center gap-2 bg-background p-1.5 rounded-lg border border-border">
                  <input
                    type="color"
                    value={customColors[theme]?.["--shadow-color"] || DEFAULT_THEME[theme]["--shadow-color"]}
                    onChange={(e) => setCustomColor(theme, "--shadow-color", e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                  />
                  <span className="text-xs font-mono text-text-primary uppercase truncate">
                    {customColors[theme]?.["--shadow-color"] || DEFAULT_THEME[theme]["--shadow-color"]}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-secondary font-medium">Shadow Blur</label>
                <div className="flex items-center gap-2 bg-background p-1.5 rounded-lg border border-border">
                  <input
                    type="text"
                    value={customColors[theme]?.["--shadow-blur"] || DEFAULT_THEME[theme]["--shadow-blur"]}
                    onChange={(e) => setCustomColor(theme, "--shadow-blur", e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs font-mono text-text-primary"
                    placeholder="e.g. 10px"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-text-secondary font-medium">Shadow Intensity</label>
                <div className="flex items-center gap-2 bg-background p-1.5 rounded-lg border border-border">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={customColors[theme]?.["--shadow-intensity"] || DEFAULT_THEME[theme]["--shadow-intensity"]}
                    onChange={(e) => setCustomColor(theme, "--shadow-intensity", e.target.value)}
                    className="w-full accent-primary"
                  />
                  <span className="text-xs font-mono text-text-primary w-8 text-right">
                    {customColors[theme]?.["--shadow-intensity"] || DEFAULT_THEME[theme]["--shadow-intensity"]}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings2 size={20} className="text-primary" />
                <span className="font-medium">Advanced Mode</span>
              </div>
              <button
                onClick={() => setAdvancedMode(!advancedMode)}
                className="w-14 h-8 bg-border rounded-full relative transition-colors focus:outline-none"
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-surface rounded-full shadow-sm transition-transform ${advancedMode ? "translate-x-6 bg-primary" : "translate-x-0"}`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Data Management
          </h3>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-3 bg-background rounded-xl hover:bg-surface  transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download size={20} className="text-text-secondary" />
                <span className="font-medium">Export Data</span>
              </div>
            </button>
            <button
              onClick={handleImport}
              className="w-full flex items-center justify-between p-3 bg-background rounded-xl hover:bg-surface  transition-colors"
            >
              <div className="flex items-center gap-3">
                <Upload size={20} className="text-text-secondary" />
                <span className="font-medium">Import Data</span>
              </div>
            </button>
            <button
              onClick={handleResetPremium}
              className="w-full flex items-center justify-between p-3 bg-error/5 rounded-xl hover:bg-error/10 transition-colors border border-error/10"
            >
              <div className="flex items-center gap-3">
                <ShieldOff size={20} className="text-error" />
                <span className="font-medium text-error">Debug: Reset Premium Status</span>
              </div>
            </button>
          </div>
          <p className="text-xs text-text-secondary mt-4 flex items-center gap-1">
            <Database size={12} />
            All data is stored locally on your device.
          </p>
        </div>
      </div>
      {advancedMode && <MediaManager />}
    </div>
  );
}
