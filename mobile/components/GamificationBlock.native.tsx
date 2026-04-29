import { StyleSheet, Text, View } from "react-native";
import { Gamification } from "../types";

interface Props {
  data: Gamification;
}

export default function GamificationBlock({ data }: Props) {
  return (
    <View style={s.card}>
      <Text style={s.streakText}>
        🔥 Стрик: {data.streak_months} {pluralMonths(data.streak_months)} подряд
      </Text>

      <View style={s.badgesRow}>
        {data.badges.map((badge) => (
          <View key={badge.id} style={[s.badge, !badge.earned && s.badgeInactive]}>
            <Text style={s.badgeIcon}>{badge.icon}</Text>
            <Text style={s.badgeTitle} numberOfLines={2}>{badge.title}</Text>
          </View>
        ))}
      </View>

      {data.next_level && (
        <View style={s.progressWrap}>
          <Text style={s.progressLabel}>
            До уровня {data.next_level}: {data.progress_percent}%
          </Text>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${data.progress_percent ?? 0}%` as any }]} />
          </View>
        </View>
      )}

      {!data.next_level && (
        <Text style={s.maxLevel}>👑 Максимальный уровень HIGH</Text>
      )}
    </View>
  );
}

function pluralMonths(n: number) {
  const m = n % 10, h = n % 100;
  if (h >= 11 && h <= 19) return "месяцев";
  if (m === 1) return "месяц";
  if (m >= 2 && m <= 4) return "месяца";
  return "месяцев";
}

const s = StyleSheet.create({
  card: { backgroundColor: "#1C1C1E", borderRadius: 16, padding: 16 },
  streakText: { color: "#FFF", fontSize: 16, fontWeight: "600", marginBottom: 14 },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  badge: {
    backgroundColor: "#FFDD2D", borderRadius: 12, padding: 8,
    alignItems: "center", width: 62,
  },
  badgeInactive: { backgroundColor: "#2C2C2E", opacity: 0.5 },
  badgeIcon: { fontSize: 22 },
  badgeTitle: { color: "#000", fontSize: 9, fontWeight: "600", marginTop: 2, textAlign: "center" },
  progressWrap: { marginTop: 14 },
  progressLabel: { color: "#AAA", fontSize: 13, marginBottom: 6 },
  progressBg: { height: 8, backgroundColor: "#333", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, backgroundColor: "#FFDD2D", borderRadius: 4 },
  maxLevel: { color: "#FFDD2D", fontSize: 14, fontWeight: "600", marginTop: 12 },
});
