import { StyleSheet, Text, View } from "react-native";
import { ForecastItem } from "../types";

interface Props {
  data: ForecastItem[];
}

function currencyLabel(c: string) {
  if (c === "rub") return "₽";
  if (c === "miles") return "миль";
  return "баллов";
}

export default function ForecastBlock({ data }: Props) {
  if (data.length === 0) return null;

  return (
    <View style={s.card}>
      <Text style={s.title}>📈 Прогноз до конца года</Text>
      {data.map((item) => (
        <View key={item.program_name} style={s.row}>
          <Text style={s.programName}>{item.program_name}</Text>
          <Text style={s.amount}>
            +{item.forecast_amount.toLocaleString("ru-RU")} {currencyLabel(item.currency)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: "#1C1C1E", borderRadius: 16, padding: 16 },
  title: { color: "#FFF", fontSize: 15, fontWeight: "700", marginBottom: 12 },
  row: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 8,
  },
  programName: { color: "#AAA", fontSize: 14 },
  amount: { color: "#FFDD2D", fontSize: 16, fontWeight: "700" },
});
