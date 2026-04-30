/**
 * Компонент геймификации — стрики, бейджи, прогресс.
 * Даша: frontend/src/components/GamificationBlock.tsx
 * Ника: просто <GamificationBlock userId={id} /> в UserPage
 *
 * Все размеры в rem/em — адаптируется под системный шрифт пользователя.
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
      <div style={{ padding: "1.25rem" }}>
        <div className="skeleton" style={{ height: "1.25rem", width: "10rem", borderRadius: "0.375rem", marginBottom: "1rem" }} />
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: "3.5rem", width: "3.5rem", borderRadius: "0.75rem" }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: "0.75rem", width: "100%", borderRadius: "0.375rem" }} />
      </div>
    );
  }

  // --- Ошибка ---
  if (error || !data) {
    return (
      <div style={{ padding: "1.25rem", color: "#EF4444", fontSize: "0.8125rem" }}>
        Не удалось загрузить геймификацию: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Заголовок */}
      <p style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
        Достижения
      </p>

      {/* Стрик */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.75rem",
        backgroundColor: "rgba(255, 221, 45, 0.12)",
        borderRadius: "0.875rem", padding: "0.75rem 1rem",
      }}>
        <span style={{ fontSize: "1.5rem" }}>🔥</span>
        <div>
          <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>
            Стрик: {data.streak_months} {pluralMonths(data.streak_months)} подряд
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.125rem" }}>
            Продолжайте пользоваться картой каждый месяц
          </p>
        </div>
      </div>

      {/* Бейджи */}
      <div>
        <p style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Бейджи
        </p>
        {/* медиа-запрос и псевдоэлементы — только через класс, не инлайн */}
        <style>{`
          .badges-scroll::-webkit-scrollbar { display: none; }
          .badge-item { flex: 1 1 0; }
          @media (max-width: 480px) {
            .badge-item { flex: none; min-width: 80px; max-width: 80px; flex-shrink: 0; }
          }
        `}</style>
        <div
          className="badges-scroll"
          style={{
            display: "flex",
            flexDirection: "row",
            overflowX: "auto",
            gap: "8px",
            paddingBottom: "0.5rem",
            scrollbarWidth: "none",
          }}
        >
          {data.badges.map((badge) => (
            <div
              key={badge.id}
              title={badge.description}
              className="badge-item"
              style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                borderRadius: "1rem",
                minHeight: "5.5rem", padding: "0.625rem 0.375rem",
                fontSize: "2rem",
                backgroundColor: badge.earned ? "#FFDD2D" : "var(--bg-primary)",
                opacity: badge.earned ? 1 : 0.45,
                filter: badge.earned ? "none" : "grayscale(1)",
                boxShadow: badge.earned ? "0 3px 10px rgba(255,221,45,0.45)" : "none",
                cursor: "default",
              }}
            >
              <span style={{ lineHeight: 1, fontSize: "2rem" }}>{badge.icon}</span>
              <span style={{
                fontSize: "0.6875rem", marginTop: "0.375rem", fontWeight: 600, textAlign: "center",
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
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.375rem" }}>
            <span>Прогресс до уровня {data.next_level}</span>
            <span>{data.progress_percent}%</span>
          </div>
          <div style={{
            width: "100%", backgroundColor: "var(--border-color)",
            borderRadius: "99px", height: "0.625rem", overflow: "hidden",
          }}>
            <div style={{
              height: "0.625rem", borderRadius: "99px",
              backgroundColor: "#FFDD2D",
              width: `${data.progress_percent}%`,
              transition: "width 0.7s ease",
            }} />
          </div>
        </div>
      )}

      {/* Уже максимум */}
      {data.next_level === null && (
        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <span style={{ lineHeight: 1 }}>👑</span>
          <span>Вы на максимальном уровне <span style={{ color: "#FFDD2D" }}>HIGH</span></span>
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