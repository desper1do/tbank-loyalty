import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Segment = "LOW" | "MEDIUM" | "HIGH";

interface Product {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  ctaText: string;
}

const PRODUCTS: Record<Segment, Product[]> = {
  LOW: [
    {
      id: "tmobile-1",
      icon: "📱",
      title: "Т-Мобайл",
      subtitle: "Мобильная связь",
      description: "Подключи связь и получай кэшбэк за звонки и интернет",
      accentColor: "#FFDD2D",
      ctaText: "Подключить",
    },
    {
      id: "tmobile-2",
      icon: "🎁",
      title: "Т-Мобайл Плюс",
      subtitle: "Больше выгоды",
      description: "Безлимитный интернет и двойной кэшбэк за первые 3 месяца",
      accentColor: "#FF9500",
      ctaText: "Узнать больше",
    },
  ],
  MEDIUM: [
    {
      id: "invest-1",
      icon: "📈",
      title: "Т-Инвестиции",
      subtitle: "Начни инвестировать",
      description: "Инвестируй от 1 000 ₽ и получи бонус на первую сделку",
      accentColor: "#22C55E",
      ctaText: "Начать",
    },
    {
      id: "invest-2",
      icon: "💰",
      title: "Накопительный счёт",
      subtitle: "До 18% годовых",
      description: "Размести свободные средства с повышенной ставкой",
      accentColor: "#FFDD2D",
      ctaText: "Открыть счёт",
    },
    {
      id: "tmobile-medium",
      icon: "📱",
      title: "Т-Мобайл",
      subtitle: "Для клиентов Т-Банка",
      description: "Специальные условия на связь с кэшбэком рублями",
      accentColor: "#1A56DB",
      ctaText: "Подключить",
    },
  ],
  HIGH: [
    {
      id: "business-1",
      icon: "💼",
      title: "Т-Бизнес",
      subtitle: "Бизнес-счёт",
      description: "Открой бизнес-счёт с повышенным кэшбэком на все операции",
      accentColor: "#FFDD2D",
      ctaText: "Открыть счёт",
    },
    {
      id: "business-2",
      icon: "🏢",
      title: "Т-Бизнес Про",
      subtitle: "Премиум для бизнеса",
      description: "Персональный менеджер, эквайринг 0% и бесплатные переводы",
      accentColor: "#22C55E",
      ctaText: "Узнать больше",
    },
    {
      id: "invest-high",
      icon: "📊",
      title: "Т-Инвестиции Про",
      subtitle: "Для серьёзных вложений",
      description: "ИИС, брокерский счёт и аналитика для опытных инвесторов",
      accentColor: "#A855F7",
      ctaText: "Перейти",
    },
  ],
};

interface Props {
  segment: string;
}

export default function CrossSellBlock({ segment }: Props) {
  const products = PRODUCTS[(segment as Segment)] ?? PRODUCTS.LOW;

  return (
    <View style={s.wrap}>
      <Text style={s.subtitle}>Подобрано специально для вашего уровня</Text>
      {products.map(p => (
        <View key={p.id} style={s.card}>
          <View style={[s.iconBox, { backgroundColor: p.accentColor }]}>
            <Text style={s.iconText}>{p.icon}</Text>
          </View>
          <View style={s.info}>
            <View style={s.titleRow}>
              <Text style={s.title}>{p.title}</Text>
              <Text style={s.subtitle2}>{p.subtitle}</Text>
            </View>
            <Text style={s.desc} numberOfLines={2}>{p.description}</Text>
          </View>
          <TouchableOpacity
            style={[s.cta, { backgroundColor: p.accentColor }]}
            activeOpacity={0.8}
          >
            <Text style={[s.ctaText, { color: p.accentColor === "#FFDD2D" ? "#000" : "#fff" }]}>
              {p.ctaText}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 10 },
  subtitle: { color: "#8E8E93", fontSize: 12, marginBottom: 2 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#141414", borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: "#2C2C2E",
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  iconText: { fontSize: 22 },
  info: { flex: 1, gap: 2 },
  titleRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  title: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  subtitle2: { color: "#8E8E93", fontSize: 11 },
  desc: { color: "#8E8E93", fontSize: 12, lineHeight: 17 },
  cta: {
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, flexShrink: 0,
  },
  ctaText: { fontSize: 12, fontWeight: "700" },
});
