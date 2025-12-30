// app/(tabs)/menu/settings.tsx
import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
  return (
    <SafeAreaView style={s.container}>
      <View>
        <Text style={s.title}>Settings</Text>
        <View style={s.row}>
          <Text style={s.label}>Enable push notifications</Text>
          <Switch value={true} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700" },
  row: {
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#efeae6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontSize: 15 },
});
