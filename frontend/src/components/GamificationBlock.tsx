/**
 * Компонент геймификации — стрики, бейджи, прогресс.
 * Даша: frontend/src/components/GamificationBlock.tsx
 * Ника: просто <GamificationBlock userId={id} /> в UserPage
 */
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
      <div style={{ padding: 20 }}>
        <div className="skeleton" style={{ height: 20, width: 160, borderRadius: 6, marginBottom: 16 }} />
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 56, width: 56, borderRadius: 12 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 12, width: "100%", borderRadius: 6 }} />
      </div>
    );
  }

  // --- Ошибка ---
  if (error || !data) {
    return (
      <div style={{ padding: 20, color: "#EF4444", fontSize: 13 }}>
        Не удалось загрузить геймификацию: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Заголовок */}
      <p style={{ fontWeight: 700, fontSize: 17, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
        Достижения
      </p>

      {/* Стрик */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        backgroundColor: "rgba(255, 221, 45, 0.12)",
        borderRadius: 14, padding: "12px 16px",
      }}>
        <span style={{ fontSize: 24 }}>🔥</span>
        <div>
          <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
            Стрик: {data.streak_months} {pluralMonths(data.streak_months)} подряд
          </p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
            Продолжайте пользоваться картой каждый месяц
          </p>
        </div>
      </div>

      {/* Бейджи */}
      <div>
        <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Бейджи
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {data.badges.map((badge) => (
            <div
              key={badge.id}
              title={badge.description}
              style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                borderRadius: 16,
                // Фиксированная ширина и минимальная высота — текст не обрезается
                width: 100, minHeight: 108, padding: "10px 6px",
                fontSize: 28, transition: "all 0.2s",
                backgroundColor: badge.earned ? "#FFDD2D" : "var(--bg-primary)",
                opacity: badge.earned ? 1 : 0.45,
                filter: badge.earned ? "none" : "grayscale(1)",
                boxShadow: badge.earned ? "0 3px 10px rgba(255,221,45,0.45)" : "none",
                cursor: "default",
              }}
            >
              <span style={{ lineHeight: 1 }}>{badge.icon}</span>
              <span style={{
                // Убираем однострочный обрез — позволяем переносить текст
                fontSize: 10, marginTop: 6, fontWeight: 600, textAlign: "center",
                lineHeight: 1.25, width: "100%",
                color: badge.earned ? "#000" : "var(--text-secondary)",
                wordBreak: "break-word",
                hyphens: "auto" as const,
              }}>
                {badge.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Прогресс до следующего уровня */}
      {data.next_level !== null && data.progress_percent !== null && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>
            <span>Прогресс до уровня {data.next_level}</span>
            <span>{data.progress_percent}%</span>
          </div>
          <div style={{
            width: "100%", backgroundColor: "var(--border-color)",
            borderRadius: 99, height: 10, overflow: "hidden",
          }}>
            <div style={{
              height: 10, borderRadius: 99,
              backgroundColor: "#FFDD2D",
              width: `${data.progress_percent}%`,
              transition: "width 0.7s ease",
            }} />
          </div>
        </div>
      )}

      {/* Уже максимум */}
      {data.next_level === null && (
        <p style={{ fontSize: 14, fontWeight: 600, color: "#FFDD2D" }}>
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