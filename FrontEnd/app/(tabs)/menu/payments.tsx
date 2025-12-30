// app/(tabs)/menu/payments.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Payments() {
  return (
    <SafeAreaView style={p.container}>
      <View>
        <Text style={p.title}>Payments</Text>
        <View style={p.card}>
          <Text style={p.info}>
            Payment history and methods coming soon.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const p = StyleSheet.create({
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
