import { useLiveQuery } from "dexie-react-hooks";
import { useTranslation } from "react-i18next";
import { db } from "../db";
import { Calendar, Clock, Activity } from "lucide-react";

export default function HistoryScreen() {
  const { t } = useTranslation();

  const logs = useLiveQuery(() =>
    db.workout_logs.orderBy("start_time").reverse().toArray(),
  );

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes} min`;
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-6 px-2">{t("app.history")}</h2>

      <div className="flex-1 overflow-y-auto space-y-4 p-2 pb-6">
        {logs === undefined ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center p-8 text-text-secondary bg-surface rounded-2xl border border-border">
            <Activity
              size={48}
              className="mx-auto mb-4 text-text-secondary"
            />
            <p>No workouts recorded yet.</p>
            <p className="text-sm mt-2">Complete a workout to see it here!</p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.log_id}
              className="bg-surface p-5 rounded-2xl border border-border shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">{log.list_name}</h3>
                <span className="text-xs font-medium px-2 py-1 bg-success/20 text-success rounded-md">
                  Completed
                </span>
              </div>

              <div className="flex gap-6 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{formatDate(log.start_time)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{formatDuration(log.total_duration)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
