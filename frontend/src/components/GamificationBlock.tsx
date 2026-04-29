/**
 * Компонент геймификации — стрики, бейджи, прогресс.
 * Даша: frontend/src/components/GamificationBlock.tsx
 * Ника: просто <GamificationBlock userId={id} /> в UserPage
 */
import React from "react";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// --- Типы ---
interface Badge {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  icon: string;
}

interface GamificationData {
  streak_months: number;
  badges: Badge[];
  next_level: string | null;
  progress_percent: number | null;
}

interface Props {
  userId: number;
}

// --- Компонент ---
export default function GamificationBlock({ userId }: Props) {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/users/${userId}/gamification`)
      .then((res) => {
        if (!res.ok) throw new Error(`Ошибка ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  // --- Скелетон ---
  if (loading) {
    return (
      <div className="animate-pulse" style={{padding: 20}}>
        <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-700 rounded mb-4" />
        <div className="flex gap-3 mb-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 w-14 rounded-xl bg-zinc-200 dark:bg-zinc-700" />
          ))}
        </div>
        <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-700 rounded" />
      </div>
    );
  }

  // --- Ошибка ---
  if (error || !data) {
    return (
      <div style={{padding: 20, color: "#EF4444", fontSize: 13}}>
        Не удалось загрузить геймификацию: {error}
      </div>
    );
  }

  return (
    <div style={{padding: 20, display: "flex", flexDirection: "column", gap: 20}}>
      {/* Заголовок */}
      <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
        Достижения
      </h2>

      {/* Стрик */}
      <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl px-4 py-3">
        <span className="text-2xl">🔥</span>
        <div>
          <p className="font-semibold text-zinc-900 dark:text-white text-sm">
            Стрик: {data.streak_months}{" "}
            {pluralMonths(data.streak_months)} подряд
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Продолжайте пользоваться картой каждый месяц
          </p>
        </div>
      </div>

      {/* Бейджи */}
      <div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
          Бейджи
        </p>
        <div className="flex flex-wrap gap-3">
          {data.badges.map((badge) => (
            <div
              key={badge.id}
              title={badge.description}
              className={[
                "flex flex-col items-center justify-center rounded-xl w-16 h-16 text-2xl transition-all",
                badge.earned
                  ? "bg-yellow-400 dark:bg-yellow-500 shadow-md"
                  : "bg-zinc-100 dark:bg-zinc-800 opacity-40 grayscale",
              ].join(" ")}
            >
              <span>{badge.icon}</span>
              <span className="text-[9px] mt-0.5 text-zinc-700 dark:text-zinc-300 font-medium leading-tight text-center px-1 line-clamp-1">
                {badge.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Прогресс до следующего уровня */}
      {data.next_level !== null && data.progress_percent !== null && (
        <div>
          <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <span>Прогресс до уровня {data.next_level}</span>
            <span>{data.progress_percent}%</span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-yellow-400 transition-all duration-700"
              style={{ width: `${data.progress_percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Уже максимум */}
      {data.next_level === null && (
        <p className="text-sm text-yellow-500 font-semibold">
          👑 Вы на максимальном уровне HIGH
        </p>
      )}
    </div>
  );
}

// Склонение слова "месяц"
function pluralMonths(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return "месяцев";
  if (mod10 === 1) return "месяц";
  if (mod10 >= 2 && mod10 <= 4) return "месяца";
  return "месяцев";
}