import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useUIStore, useWorkoutStore, useAuthStore } from "./store";
import { Home, List, Play, History, Settings, LogOut } from "lucide-react";
import { cn } from "./lib/utils";

import SelectionScreen from "./components/SelectionScreen";
import QueueScreen from "./components/QueueScreen";
import WorkoutScreen from "./components/WorkoutScreen";
import HistoryScreen from "./components/HistoryScreen";
import SettingsScreen from "./components/SettingsScreen";
import HomeScreen from "./components/HomeScreen";
import WizardScreen from "./components/WizardScreen";
import AuthScreen from "./components/AuthScreen";
import PremiumLockoutScreen from "./components/PremiumLockoutScreen";

const TRIAL_DAYS = 7;

export default function App() {
  const { t } = useTranslation();
  const { theme, customColors } = useUIStore();
  const { queue } = useWorkoutStore();
  const { user, logout } = useAuthStore();
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    const colorKeys = [
      "--bg-color", "--surface-color", "--primary-color", "--secondary-color",
      "--accent-color", "--cta-color", "--text-primary-color", "--text-secondary-color",
      "--border-color", "--success-color", "--warning-color", "--error-color",
      "--shadow-color", "--shadow-blur", "--shadow-intensity",
    ];
    colorKeys.forEach((key) => root.style.removeProperty(key));

    const currentCustomColors = customColors[theme];
    if (currentCustomColors) {
      Object.entries(currentCustomColors).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [theme, customColors]);

  if (!user) {
    return <AuthScreen />;
  }

  const isTrialExpired = () => {
    if (user.isPremium) return false;
    const now = Date.now();
    const trialEnd = user.trialStartDate + TRIAL_DAYS * 24 * 60 * 60 * 1000;
    return now > trialEnd;
  };

  if (isTrialExpired()) {
    return <PremiumLockoutScreen />;
  }

  // Hide bottom nav during an active workout
  const isWorkoutActive = location.pathname === "/workout";

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans transition-colors duration-200">
      <header className="bg-surface shadow-sm px-4 flex justify-between items-center sticky top-0 z-10 h-16">
        <div className="flex items-center">
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-error/10 text-error border border-error/20 rounded-lg hover:bg-error hover:text-white transition-all text-sm font-semibold shadow-sm active:scale-95"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
        <div className="flex items-center gap-3 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <img
            src="https://picsum.photos/seed/cubefit/64/64"
            alt="CubeFit Logo"
            className="w-9 h-9 rounded-lg shadow-sm"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-xl font-bold text-primary">{t("app.title")}</h1>
        </div>
        <div className="w-10 flex justify-end">
          {queue.length > 0 && !isWorkoutActive && (
            <button
              onClick={() => navigate("/queue")}
              className="relative p-2 text-text-secondary hover:text-primary transition-colors"
            >
              <List size={24} />
              <span className="absolute top-0 right-0 bg-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1/4 -translate-y-1/4">
                {queue.length}
              </span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full flex flex-col">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/library" element={<SelectionScreen />} />
          <Route path="/wizard" element={<WizardScreen />} />
          <Route path="/queue" element={<QueueScreen />} />
          <Route path="/workout" element={<WorkoutScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          
          {/* Fallback route: redirects any unknown URL back to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isWorkoutActive && (
        <nav className="bg-surface border-t border-border flex justify-around p-3 pb-6 sticky bottom-0 z-10">
          <NavItem
            icon={<Home />}
            label="Home"
            active={location.pathname === "/"}
            onClick={() => navigate("/")}
          />
          <NavItem
            icon={<History />}
            label="History"
            active={location.pathname === "/history"}
            onClick={() => navigate("/history")}
          />
          <NavItem
            icon={<Settings />}
            label="Settings"
            active={location.pathname === "/settings"}
            onClick={() => navigate("/settings")}
          />
        </nav>
      )}
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-16 h-12 transition-colors",
        active ? "text-primary" : "text-text-secondary hover:text-text-primary",
      )}
    >
      {icon}
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );
}