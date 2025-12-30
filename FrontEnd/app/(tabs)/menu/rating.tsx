// app/(tabs)/menu/rating.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function RatingDetail() {
  return (
    <SafeAreaView style={s.container}>
      <View>
        <Text style={s.title}>Rating</Text>
        <View style={s.center}>
          <Ionicons name="star" size={48} color="#f1c40f" />
          <Text style={s.big}>4.8</Text>
          <Text style={s.small}>Based on 142 reviews</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  center: { marginTop: 24, alignItems: "center" },
  big: { fontSize: 36, fontWeight: "800", marginTop: 8 },
  small: { marginTop: 6, color: "#666" },
});
