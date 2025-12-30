// app/(tabs)/menu/notifications.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Notifications() {
  return (
    <SafeAreaView style={n.container}>
      <View>
        <Text style={n.title}>Notifications</Text>
        <View style={n.card}>
          <Text style={n.info}>No notifications yet.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const n = StyleSheet.create({
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
