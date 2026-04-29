import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API = "http://localhost:8000";

// --- Типы ---
interface User {
  id: number;
  full_name: string;
  email: string;
  financial_segment: string;
}

interface Balance {
  program_name: string;
  currency: string;
  current_balance: number;
}

interface Offer {
  partner_id: number;
  partner_name: string;
  short_description: string;
  cashback_percent: number;
  brand_color_hex: string;
}

interface Badge {
  id: string;
  title: string;
  icon: string;
  earned: boolean;
}

interface Gamification {
  streak_months: number;
  badges: Badge[];
  next_level: string | null;
  progress_percent: number | null;
}

// ============================================================
// ЭКРАН СПИСКА ПОЛЬЗОВАТЕЛЕЙ
// ============================================================
function UsersScreen({ onSelect }: { onSelect: (u: User) => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/users/`)
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#FFDD2D" />
      </View>
    );

  return (
    <SafeAreaView style={s.screen}>
      <Text style={s.header}>Т-Банк Лояльность</Text>
      <FlatList
        data={users}
        keyExtractor={(u) => String(u.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.userCard} onPress={() => onSelect(item)}>
            <View>
              <Text style={s.userName}>{item.full_name}</Text>
              <Text style={s.userEmail}>{item.email}</Text>
            </View>
            <View style={[s.segmentBadge, segmentColor(item.financial_segment)]}>
              <Text style={s.segmentText}>{item.financial_segment}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

// ============================================================
// ЭКРАН ЛОЯЛЬНОСТИ ПОЛЬЗОВАТЕЛЯ
// ============================================================
function LoyaltyScreen({ user, onBack }: { user: User; onBack: () => void }) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [gamification, setGamification] = useState<Gamification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/users/${user.id}/balances`).then((r) => r.ok ? r.json() : []).catch(() => []),
fetch(`${API}/users/${user.id}/offers`).then((r) => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API}/users/${user.id}/gamification`).then((r) => r.json()).catch(() => null),
    ]).then(([b, o, g]) => {
      setBalances(b);
      setOffers(o);
      setGamification(g);
      setLoading(false);
    });
  }, [user.id]);

  if (loading)
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#FFDD2D" />
      </View>
    );

  return (
    <SafeAreaView style={s.screen}>
      {/* Шапка */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={onBack}>
          <Text style={s.backBtn}>← Назад</Text>
        </TouchableOpacity>
        <Text style={s.header}>{user.full_name}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        {/* Балансы */}
        <Text style={s.sectionTitle}>Мои программы</Text>
        {balances.length === 0 ? (
          <Text style={s.empty}>Балансы недоступны</Text>
        ) : (
          balances.map((b) => (
            <View key={b.program_name} style={s.balanceCard}>
              <Text style={s.balanceName}>{b.program_name}</Text>
              <Text style={s.balanceAmount}>
                {b.current_balance.toLocaleString("ru-RU")} {currencyLabel(b.currency)}
              </Text>
            </View>
          ))
        )}

        {/* Геймификация */}
        {gamification && (
          <>
            <Text style={s.sectionTitle}>Достижения</Text>
            <View style={s.card}>
              <Text style={s.streakText}>
                🔥 Стрик: {gamification.streak_months} {pluralMonths(gamification.streak_months)} подряд
              </Text>
              <View style={s.badgesRow}>
                {gamification.badges.map((badge) => (
                  <View
                    key={badge.id}
                    style={[s.badge, !badge.earned && s.badgeInactive]}
                  >
                    <Text style={s.badgeIcon}>{badge.icon}</Text>
                    <Text style={s.badgeTitle} numberOfLines={1}>{badge.title}</Text>
                  </View>
                ))}
              </View>
              {gamification.next_level && (
                <View style={{ marginTop: 12 }}>
                  <Text style={s.progressLabel}>
                    До уровня {gamification.next_level}: {gamification.progress_percent}%
                  </Text>
                  <View style={s.progressBg}>
                    <View
                      style={[s.progressFill, { width: `${gamification.progress_percent ?? 0}%` as any }]}
                    />
                  </View>
                </View>
              )}
            </View>
          </>
        )}

        {/* Офферы */}
        <Text style={s.sectionTitle}>Акции партнёров</Text>
        {offers.length === 0 ? (
          <Text style={s.empty}>Акции недоступны</Text>
        ) : (
          offers.slice(0, 5).map((o) => (
            <View
              key={o.partner_id}
              style={[s.offerCard, { backgroundColor: o.brand_color_hex || "#1C1C1E" }]}
            >
              <Text style={s.offerName}>{o.partner_name}</Text>
              <Text style={s.offerDesc}>{o.short_description}</Text>
              <Text style={s.offerPercent}>{o.cashback_percent}% кэшбэк</Text>
            </View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// ROOT — навигация между экранами
// ============================================================
export default function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (selectedUser)
    return <LoyaltyScreen user={selectedUser} onBack={() => setSelectedUser(null)} />;

  return <UsersScreen onSelect={setSelectedUser} />;
}

// ============================================================
// ХЕЛПЕРЫ
// ============================================================
function currencyLabel(c: string) {
  if (c === "rub") return "₽";
  if (c === "miles") return "миль";
  return "баллов";
}

function pluralMonths(n: number) {
  const m = n % 10, h = n % 100;
  if (h >= 11 && h <= 19) return "месяцев";
  if (m === 1) return "месяц";
  if (m >= 2 && m <= 4) return "месяца";
  return "месяцев";
}

function segmentColor(seg: string) {
  if (seg === "HIGH") return { backgroundColor: "#FFDD2D" };
  if (seg === "MEDIUM") return { backgroundColor: "#FF8C00" };
  return { backgroundColor: "#555" };
}

// ============================================================
// СТИЛИ
// ============================================================
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0A0A0A" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0A0A0A" },
  header: { fontSize: 22, fontWeight: "700", color: "#FFDD2D", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  topBar: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 8 },
  backBtn: { color: "#FFDD2D", fontSize: 16, paddingHorizontal: 16, paddingVertical: 8 },
  userCard: {
    backgroundColor: "#1C1C1E", borderRadius: 16, padding: 16,
    marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  userName: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  userEmail: { color: "#888", fontSize: 13, marginTop: 2 },
  segmentBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  segmentText: { fontSize: 12, fontWeight: "700", color: "#000" },
  sectionTitle: { color: "#FFF", fontSize: 18, fontWeight: "700", marginTop: 8 },
  card: { backgroundColor: "#1C1C1E", borderRadius: 16, padding: 16 },
  balanceCard: {
    backgroundColor: "#1C1C1E", borderRadius: 16, padding: 16,
    marginBottom: 8, flexDirection: "row", justifyContent: "space-between",
  },
  balanceName: { color: "#AAA", fontSize: 14 },
  balanceAmount: { color: "#FFDD2D", fontSize: 18, fontWeight: "700" },
  streakText: { color: "#FFF", fontSize: 16, fontWeight: "600", marginBottom: 12 },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: { backgroundColor: "#FFDD2D", borderRadius: 12, padding: 8, alignItems: "center", width: 64 },
  badgeInactive: { backgroundColor: "#333", opacity: 0.5 },
  badgeIcon: { fontSize: 22 },
  badgeTitle: { color: "#000", fontSize: 9, fontWeight: "600", marginTop: 2, textAlign: "center" },
  progressLabel: { color: "#AAA", fontSize: 13, marginBottom: 6 },
  progressBg: { height: 8, backgroundColor: "#333", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, backgroundColor: "#FFDD2D", borderRadius: 4 },
  offerCard: { borderRadius: 16, padding: 16, marginBottom: 8 },
  offerName: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  offerDesc: { color: "#DDD", fontSize: 13, marginTop: 4 },
  offerPercent: { color: "#FFDD2D", fontSize: 15, fontWeight: "700", marginTop: 8 },
  empty: { color: "#555", fontSize: 14 },
});
