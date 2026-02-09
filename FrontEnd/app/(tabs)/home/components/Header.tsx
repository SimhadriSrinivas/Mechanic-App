import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "../../../../styles/homeStyles";

export default function Header() {
  const router = useRouter();

  return (
    <View style={local.wrapper}>
      <View style={local.container}>
        {/* ☰ Open menu */}
        <TouchableOpacity
          style={local.iconBtn}
          onPress={() => router.push("/menu")}
          accessibilityLabel="Open menu"
        >
          <Ionicons name="menu" size={28} color={colors.navyStart} />
        </TouchableOpacity>

        {/* center spacer */}
        <View style={local.center} />

        {/* 🔧 Tools / Settings */}
        <TouchableOpacity
          style={local.iconBtn}
          accessibilityLabel="Tools"
        >
          <Ionicons name="construct" size={26} color={colors.navyStart} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const local = StyleSheet.create({
  /* Outer wrapper = navbar background */
  wrapper: {
    width: "100%",
    backgroundColor: colors.bg, // cream home bg
    borderBottomWidth: 1,
    borderBottomColor: "#e5e0d8",
  },

  /* Inner row */
  container: {
    height: 56, // proper navbar height
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconBtn: {
    padding: 8,
  },

  center: {
    flex: 1,
  },
});
