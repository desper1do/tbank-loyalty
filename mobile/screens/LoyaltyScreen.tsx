import { useEffect, useState } from "react";
import {
  ActivityIndicator, SafeAreaView, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { fetchBalances, fetchForecast, fetchGamification, fetchOffers } from "../api";
import ForecastBlock from "../components/ForecastBlock";
import GamificationBlock from "../components/GamificationBlock.native";
import { Balance, ForecastItem, Gamification, Offer, User } from "../types";

interface Props {
  user: User;
  onBack: () => void;
}

// Совпадает с PROGRAM_CFG у Ники
const PROGRAM_CFG: Record<string, { bg: string; icon: string; label: string; textColor: string }> = {
  "Black":        { bg: "#1A1A1A", icon: "₽", label: "рублей",  textColor: "#FFF" },
  "All Airlines": { bg: "#1A56DB", icon: "✈", label: "миль",    textColor: "#FFF" },
  "Bravo":        { bg: "#FFDD2D", icon: "★", label: "баллов",  textColor: "#000" },
};

const SEGMENT_CFG: Record<string, { bg: string; color: string }> = {
  HIGH:   { bg: "#22C55E", color: "#fff" },
  MEDIUM: { bg: "#FFDD2D", color: "#000" },
  LOW:    { bg: "#EF4444", color: "#fff" },
};

export default function LoyaltyScreen({ user, onBack }: Props) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [gamification, setGamification] = useState<Gamification | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchBalances(user.id),
      fetchOffers(user.id),
      fetchGamification(user.id),
      fetchForecast(user.id),
    ])
      .then(([b, o, g, f]) => {
        setBalances(Array.isArray(b) ? b : []);
        setOffers(Array.isArray(o) ? o : []);
        setGamification(g);
        setForecast(Array.isArray(f) ? f : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.id]);

  const seg = SEGMENT_CFG[user.financial_segment] ?? SEGMENT_CFG.LOW;
  const initials = user.full_name.split(" ").slice(0, 2).map(w => w[0]).join("");

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
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={s.logoMark}>
          <Text style={s.logoText}>Т</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>

        {/* Профиль */}
        <View style={s.card}>
          <View style={s.profileRow}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.userName}>{user.full_name}</Text>
              <Text style={s.userEmail}>{user.email}</Text>
              <View style={[s.segmentBadge, { backgroundColor: seg.bg }]}>
                <Text style={[s.segmentText, { color: seg.color }]}>{user.financial_segment}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Балансы */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Мои бонусы</Text>
          {balances.length === 0 ? (
            <Text style={s.empty}>Данные загружаются...</Text>
          ) : (
            <View style={s.balancesGrid}>
              {balances.map((b) => {
                const cfg = PROGRAM_CFG[b.program_name] ?? { bg: "#333", icon: "◆", label: b.currency, textColor: "#FFF" };
                return (
                  <View key={b.program_name} style={[s.balanceCard, { backgroundColor: cfg.bg }]}>
                    <Text style={[s.balanceIcon, { color: cfg.textColor }]}>{cfg.icon}</Text>
                    <Text style={[s.balanceProgramName, { color: cfg.textColor, opacity: 0.7 }]}>{b.program_name}</Text>
                    <Text style={[s.balanceAmount, { color: cfg.textColor }]}>
                      {b.current_balance.toLocaleString("ru-RU")}
                    </Text>
                    <Text style={[s.balanceLabel, { color: cfg.textColor, opacity: 0.6 }]}>{cfg.label}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Прогноз */}
        {forecast.length > 0 && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>Прогноз до конца года</Text>
            <ForecastBlock data={forecast} />
          </View>
        )}

        {/* Геймификация */}
        {gamification && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>Достижения</Text>
            <GamificationBlock data={gamification} />
          </View>
        )}

        {/* Офферы */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Акции партнёров</Text>
          {offers.length === 0 ? (
            <Text style={s.empty}>Данные загружаются...</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
              {offers.slice(0, 6).map((o) => (
                <View
                  key={o.partner_id}
                  style={[s.offerCard, { backgroundColor: o.brand_color_hex || "#1C1C1E" }]}
                >
                  <Text style={s.offerName} numberOfLines={1}>{o.partner_name}</Text>
                  <Text style={s.offerDesc} numberOfLines={2}>{o.short_description}</Text>
                  <View style={s.cashbackBadge}>
                    <Text style={s.cashbackText}>{o.cashback_percent}%</Text>
                    <Text style={s.cashbackLabel}> кэшбэк</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0A0A0A" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0A0A0A" },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: "#1C1C1E",
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#1C1C1E", justifyContent: "center", alignItems: "center",
  },
  backText: { color: "#FFDD2D", fontSize: 18 },
  logoMark: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: "#FFDD2D", justifyContent: "center", alignItems: "center",
  },
  logoText: { fontWeight: "900", fontSize: 13, color: "#000" },
  scroll: { padding: 16, gap: 12 },
  card: { backgroundColor: "#1C1C1E", borderRadius: 20, padding: 18 },
  sectionTitle: { color: "#FFF", fontSize: 16, fontWeight: "700", marginBottom: 14, letterSpacing: -0.3 },

  // Профиль
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "#FFDD2D", justifyContent: "center", alignItems: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "900", color: "#000" },
  userName: { color: "#FFF", fontSize: 17, fontWeight: "700", letterSpacing: -0.4, marginBottom: 2 },
  userEmail: { color: "#888", fontSize: 12, marginBottom: 8 },
  segmentBadge: { alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  segmentText: { fontSize: 11, fontWeight: "700" },

  // Балансы
  balancesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  balanceCard: { borderRadius: 16, padding: 14, width: "30%", minWidth: 95 },
  balanceIcon: { fontSize: 20, marginBottom: 4 },
  balanceProgramName: { fontSize: 10, fontWeight: "500", marginBottom: 2 },
  balanceAmount: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  balanceLabel: { fontSize: 10, marginTop: 2 },

  // Офферы
  offerCard: { borderRadius: 16, padding: 14, width: 160, marginHorizontal: 4, minHeight: 140, justifyContent: "space-between" },
  offerName: { color: "#FFF", fontSize: 14, fontWeight: "700", marginBottom: 4 },
  offerDesc: { color: "rgba(255,255,255,0.8)", fontSize: 11, marginBottom: 10 },
  cashbackBadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start",
  },
  cashbackText: { color: "#FFF", fontSize: 14, fontWeight: "900" },
  cashbackLabel: { color: "rgba(255,255,255,0.8)", fontSize: 11 },
  empty: { color: "#555", fontSize: 14 },
});
