// app/(tabs)/menu/about.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function About() {
  return (
    <SafeAreaView style={a.container}>
      <View>
        <Text style={a.title}>About us</Text>
        <View style={a.card}>
          <Text style={a.info}>
            Mec-App v1.0 — delivery & vehicle assistance service.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const a = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700" },
  card: {
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#efeae6",
  },
  info: { color: "#666" },
});
