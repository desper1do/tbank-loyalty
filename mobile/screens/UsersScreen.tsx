import { useEffect, useState } from "react";
import {
  ActivityIndicator, FlatList, SafeAreaView,
  StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { fetchUsers } from "../api";
import { User } from "../types";

interface Props {
  onSelect: (user: User) => void;
}

export default function UsersScreen({ onSelect }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(() => setError("Не удалось загрузить пользователей"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#FFDD2D" />
      </View>
    );

  if (error)
    return (
      <View style={s.center}>
        <Text style={s.errorText}>{error}</Text>
      </View>
    );

  return (
    <SafeAreaView style={s.screen}>
      <View style={s.headerWrap}>
        <Text style={s.logo}>Т</Text>
        <Text style={s.header}>Лояльность</Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={(u) => String(u.id)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => onSelect(item)} activeOpacity={0.7}>
            <View style={s.cardLeft}>
              <View style={[s.avatar, segmentColor(item.financial_segment)]}>
                <Text style={s.avatarText}>{item.full_name[0]}</Text>
              </View>
              <View>
                <Text style={s.userName}>{item.full_name}</Text>
                <Text style={s.userEmail}>{item.email}</Text>
              </View>
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

function segmentColor(seg: string) {
  if (seg === "HIGH") return { backgroundColor: "#FFDD2D" };
  if (seg === "MEDIUM") return { backgroundColor: "#FF8C00" };
  return { backgroundColor: "#3A3A3C" };
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0A0A0A" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0A0A0A" },
  headerWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
  },
  logo: {
    fontSize: 22, fontWeight: "900", color: "#000",
    backgroundColor: "#FFDD2D", width: 36, height: 36,
    borderRadius: 10, textAlign: "center", lineHeight: 36,
  },
  header: { fontSize: 22, fontWeight: "700", color: "#FFF" },
  card: {
    backgroundColor: "#1C1C1E", borderRadius: 16, padding: 14,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700", color: "#000" },
  userName: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  userEmail: { color: "#888", fontSize: 12, marginTop: 2 },
  segmentBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  segmentText: { fontSize: 11, fontWeight: "700", color: "#000" },
  errorText: { color: "#FF453A", fontSize: 15 },
});
