// app/(tabs)/home/components/Header.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "../../../../styles/homeStyles";

export default function Header() {
  const router = useRouter();

  return (
    <View style={local.container}>
      {/* Open menu root */}
      <TouchableOpacity
        style={local.iconBtn}
        onPress={() => router.push("/menu")}
        accessibilityLabel="Open menu"
      >
        <Ionicons name="menu" size={28} color={colors.navyStart} />
      </TouchableOpacity>

      <View style={local.center} />

      {/* Open Tools / Settings */}
      <TouchableOpacity
        style={local.iconBtn}
        onPress={() => router.push("/menu/settings")}
        accessibilityLabel="Tools"
      >
        <Ionicons name="construct" size={26} color={colors.navyStart} />
      </TouchableOpacity>
    </View>
  );
}

const local = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconBtn: {
    padding: 8,
  },
  center: {
    flex: 1,
  },
});
