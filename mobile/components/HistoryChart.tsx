import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { HistoryMonthItem } from "../types";

interface Props {
  data: HistoryMonthItem[];
}

// Цвета программ совпадают с вебом
const PROGRAM_COLORS: Record<string, [number, number, number]> = {
  "Black":        [170, 170, 170],  // светло-серый (на тёмном фоне)
  "All Airlines": [26,  86,  219],  // #1A56DB
  "Bravo":        [255, 221, 45],   // #FFDD2D
};

const FALLBACK_COLORS: [number, number, number][] = [
  [255, 221, 45],
  [26, 86, 219],
  [34, 197, 94],
];

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function HistoryChart({ data }: Props) {
  if (data.length === 0) {
    return <Text style={s.empty}>Нет данных</Text>;
  }

  // Группируем: { month -> { program -> value } }
  const byMonth: Record<string, Record<string, number>> = {};
  const programSet = new Set<string>();

  for (const item of data) {
    if (!byMonth[item.month]) byMonth[item.month] = {};
    byMonth[item.month][item.program_name] = item.total_cashback;
    programSet.add(item.program_name);
  }

  // Берём последние 8 месяцев — чтобы метки не накладывались
  const allMonths = Object.keys(byMonth).sort();
  const months = allMonths.slice(-8);
  const programList = Array.from(programSet);

  // Метки по оси X: "01-25" → только MM.YY
  const labels = months.map(m => m.slice(5) + "." + m.slice(2, 4));

  // Датасеты: один на каждую программу
  const datasets = programList.map((prog, idx) => {
    const rgb = PROGRAM_COLORS[prog] ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
    return {
      data: months.map(m => byMonth[m]?.[prog] ?? 0),
      color: (opacity = 1) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`,
      strokeWidth: 2,
    };
  });

  const chartConfig = {
    backgroundColor: "#1C1C1E",
    backgroundGradientFrom: "#1C1C1E",
    backgroundGradientTo: "#1C1C1E",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 221, 45, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(142, 142, 147, ${opacity})`,
    propsForDots: { r: "3", strokeWidth: "0" },
    propsForBackgroundLines: { stroke: "#2C2C2E", strokeDasharray: "4 4" },
  };

  // Ширина чарта: если месяцев мало — растягиваем на весь экран,
  // иначе фиксированная ширина для горизонтального скролла
  const chartWidth = Math.max(SCREEN_WIDTH - 64, months.length * 52);

  return (
    <View>
      {/* Легенда */}
      <View style={s.legend}>
        {programList.map((prog, idx) => {
          const rgb = PROGRAM_COLORS[prog] ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
          return (
            <View key={prog} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` }]} />
              <Text style={s.legendLabel}>{prog}</Text>
            </View>
          );
        })}
      </View>

      {/* График в горизонтальном скролле */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.scroll}>
        <LineChart
          data={{ labels, datasets, legend: programList }}
          width={chartWidth}
          height={180}
          chartConfig={chartConfig}
          bezier
          withShadow={false}
          withLegend={false}
          style={s.chart}
          yAxisSuffix=""
          yAxisInterval={1}
          fromZero
        />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  empty:      { color: "#555", fontSize: 13 },
  legend:     { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
  legendLabel:{ color: "#8E8E93", fontSize: 11 },
  scroll:     { marginHorizontal: -18 },   // выходим за padding карточки
  chart:      { borderRadius: 0 },
});
