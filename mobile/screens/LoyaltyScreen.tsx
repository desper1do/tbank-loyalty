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

function currencyLabel(c: string) {
  if (c === "rub") return "₽";
  if (c === "miles") return "миль";
  return "баллов";
}

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
      .catch(() => {
        // При ошибке сети оставляем пустые массивы — приложение не крашится
      })
      .finally(() => setLoading(false));
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
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.userName}>{user.full_name}</Text>
          <Text style={s.segment}>Сегмент: {user.financial_segment}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>

        {/* Балансы */}
        <Text style={s.sectionTitle}>Мои программы</Text>
        {balances.length === 0 ? (
          <Text style={s.empty}>Данные загружаются...</Text>
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

        {/* Прогноз */}
        {forecast.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Прогноз</Text>
            <ForecastBlock data={forecast} />
          </>
        )}

        {/* Геймификация */}
        {gamification && (
          <>
            <Text style={s.sectionTitle}>Достижения</Text>
            <GamificationBlock data={gamification} />
          </>
        )}

        {/* Офферы */}
        <Text style={s.sectionTitle}>Акции партнёров</Text>
        {offers.length === 0 ? (
          <Text style={s.empty}>Данные загружаются...</Text>
        ) : (
          offers.slice(0, 6).map((o) => (
            <View
              key={o.partner_id}
              style={[s.offerCard, { backgroundColor: o.brand_color_hex || "#1C1C1E" }]}
            >
              <View style={s.offerTop}>
                <Text style={s.offerName}>{o.partner_name}</Text>
                <View style={s.cashbackBadge}>
                  <Text style={s.cashbackText}>{o.cashback_percent}%</Text>
                </View>
              </View>
              <Text style={s.offerDesc}>{o.short_description}</Text>
            </View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0A0A0A" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0A0A0A" },
  topBar: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: "#1C1C1E",
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#1C1C1E", justifyContent: "center", alignItems: "center",
  },
  backText: { color: "#FFDD2D", fontSize: 18 },
  userName: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  segment: { color: "#888", fontSize: 12, marginTop: 1 },
  scroll: { padding: 16, gap: 10 },
  sectionTitle: { color: "#FFF", fontSize: 17, fontWeight: "700", marginTop: 8 },
  balanceCard: {
    backgroundColor: "#1C1C1E", borderRadius: 16, padding: 16,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  balanceName: { color: "#AAA", fontSize: 14 },
  balanceAmount: { color: "#FFDD2D", fontSize: 20, fontWeight: "700" },
  offerCard: { borderRadius: 16, padding: 16 },
  offerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  offerName: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  cashbackBadge: {
    backgroundColor: "#FFDD2D", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  cashbackText: { color: "#000", fontSize: 13, fontWeight: "700" },
  offerDesc: { color: "#DDD", fontSize: 13, marginTop: 6 },
  empty: { color: "#555", fontSize: 14 },
});
