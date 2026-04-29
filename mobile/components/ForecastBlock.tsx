import { StyleSheet, Text, View } from "react-native";
import { ForecastItem } from "../types";

interface Props {
  data: ForecastItem[];
}

const PROGRAM_CFG: Record<string, { bg: string; icon: string; label: string; textColor: string }> = {
  "Black":        { bg: "#1A1A1A", icon: "₽", label: "рублей",  textColor: "#FFF" },
  "All Airlines": { bg: "#1A56DB", icon: "✈", label: "миль",    textColor: "#FFF" },
  "Bravo":        { bg: "#FFDD2D", icon: "★", label: "баллов",  textColor: "#000" },
};

export default function ForecastBlock({ data }: Props) {
  if (data.length === 0) return null;

  return (
    <View style={s.wrap}>
      {data.map((item) => {
        const cfg = PROGRAM_CFG[item.program_name] ?? { bg: "#333", icon: "◆", label: item.currency, textColor: "#FFF" };
        return (
          <View key={item.program_name} style={s.row}>
            <View style={[s.iconBox, { backgroundColor: cfg.bg }]}>
              <Text style={[s.icon, { color: cfg.textColor }]}>{cfg.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.programName}>
                {item.program_name} · ещё {item.months_left} мес.
              </Text>
              <Text style={s.amount}>
                +{item.forecast_amount.toLocaleString("ru-RU")} {cfg.label}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.avgLabel}>в среднем / мес</Text>
              <Text style={s.avg}>{item.avg_monthly.toLocaleString("ru-RU")}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 10 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#141414", borderRadius: 14, padding: 12,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  icon: { fontSize: 18, fontWeight: "700" },
  programName: { fontSize: 11, color: "#888", marginBottom: 2 },
  amount: { fontSize: 16, fontWeight: "800", color: "#FFF", letterSpacing: -0.3 },
  avgLabel: { fontSize: 10, color: "#888" },
  avg: { fontSize: 14, fontWeight: "600", color: "#FFF" },
});
