import { ScrollView, StyleSheet, Text, View } from "react-native";
import { HistoryMonthItem } from "../types";

interface Props {
  data: HistoryMonthItem[];
}

const PROGRAM_COLORS: Record<string, string> = {
  "Black":        "#555",
  "All Airlines": "#1A56DB",
  "Bravo":        "#FFDD2D",
};

const CHART_HEIGHT = 120;

export default function HistoryChart({ data }: Props) {
  if (data.length === 0) {
    return <Text style={s.empty}>Нет данных</Text>;
  }

  // Группируем по месяцу: {month -> {program -> value}}
  const byMonth: Record<string, Record<string, number>> = {};
  const programs = new Set<string>();

  for (const item of data) {
    if (!byMonth[item.month]) byMonth[item.month] = {};
    byMonth[item.month][item.program_name] = item.total_cashback;
    programs.add(item.program_name);
  }

  const months = Object.keys(byMonth).sort();
  const programList = Array.from(programs);

  // Максимальная сумма по месяцу (для нормализации высот)
  const maxTotal = Math.max(
    ...months.map(m => Object.values(byMonth[m]).reduce((a, b) => a + b, 0))
  );

  return (
    <View>
      {/* Легенда */}
      <View style={s.legend}>
        {programList.map(p => (
          <View key={p} style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: PROGRAM_COLORS[p] ?? "#888" }]} />
            <Text style={s.legendLabel}>{p}</Text>
          </View>
        ))}
      </View>

      {/* Бар-чарт */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={s.chartRow}>
          {months.map(month => {
            const monthData = byMonth[month];
            const total = Object.values(monthData).reduce((a, b) => a + b, 0);
            const totalHeight = maxTotal > 0 ? (total / maxTotal) * CHART_HEIGHT : 0;

            return (
              <View key={month} style={s.column}>
                {/* Стек баров сверху вниз */}
                <View style={[s.barWrap, { height: CHART_HEIGHT }]}>
                  <View style={[s.barStack, { height: totalHeight }]}>
                    {programList.map(p => {
                      const val = monthData[p] ?? 0;
                      const segH = total > 0 ? (val / total) * totalHeight : 0;
                      if (segH < 1) return null;
                      return (
                        <View
                          key={p}
                          style={{
                            height: segH,
                            backgroundColor: PROGRAM_COLORS[p] ?? "#888",
                          }}
                        />
                      );
                    })}
                  </View>
                </View>
                {/* Метка месяца: "25-01" */}
                <Text style={s.monthLabel}>{month.slice(2)}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  empty: { color: "#555", fontSize: 13 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { color: "#8E8E93", fontSize: 11 },
  chartRow: { flexDirection: "row", alignItems: "flex-end", gap: 6, paddingBottom: 4 },
  column: { alignItems: "center", width: 32 },
  barWrap: { justifyContent: "flex-end", width: 24 },
  barStack: { width: 24, borderRadius: 6, overflow: "hidden", flexDirection: "column-reverse" },
  monthLabel: { color: "#555", fontSize: 9, marginTop: 4, textAlign: "center" },
});
